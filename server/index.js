import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import sketchRoutes from './routes/sketches.js';
import billingRoutes, { stripeWebhookHandler, safepayWebhookHandler } from './routes/billing.js';

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB with Serverless Caching
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Global DB middleware to ensure connection is ready before handling routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost/127.0.0.1 port and any vercel deployment URL
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Webhook route needs raw body parser for signature verification
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);
app.post('/api/billing/safepay-webhook', express.raw({ type: 'application/json' }), safepayWebhookHandler);

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/sketches', sketchRoutes);
app.use('/api/billing', billingRoutes);

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

import jwt from 'jsonwebtoken';
import User from './models/User.js';

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { images, artStyle = 'Standard' } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required.' });
    }

    // Rate Limiting Logic
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          if (!user.isPro) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            user.generations = user.generations.filter(date => date > oneDayAgo);
            if (user.generations.length >= 3) {
              return res.status(429).json({ error: 'Daily limit of 3 sketches reached.' });
            }
            user.generations.push(new Date());
            await user.save();
          }
        }
      } catch (err) {
        console.error('Invalid token during AI generation');
      }
    } else {
      // For anonymous users, the frontend handles the 1 sketch limit via local storage.
      // We could add IP-based rate limiting here for extra security.
    }

    // Format images for Gemini
    const imageParts = images.map(img => {
        const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
        return {
            inlineData: {
                data: base64Data,
                mimeType: "image/png"
            }
        };
    });

    const prompt = `Here are ${images.length} progressive sketch steps. 
The user wants to draw this in a ${artStyle} art style. 
For each step (1 to ${images.length}), describe what new lines were added in that step compared to the previous one, and explain how to draw them keeping the ${artStyle} style in mind. 
Return your answer as a JSON array of strings, where each string is the instruction for that step.
Example: ["Start by drawing the large oval for the head", "Add two triangles for the ears", ...]
Do not include any other text, markdown formatting, or code blocks. Just the JSON array.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [prompt, ...imageParts],
        config: {
            responseMimeType: "application/json",
        }
    });

    const textResponse = response.text;
    
    let instructions = [];
    try {
        instructions = JSON.parse(textResponse);
    } catch (e) {
        console.error("Failed to parse Gemini response:", textResponse);
        return res.status(500).json({ error: 'Failed to parse AI response.', raw: textResponse });
    }

    res.json({ instructions });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the images.' });
  }
});

// Conditionally listen if not running on Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
