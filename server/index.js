import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import sketchRoutes from './routes/sketches.js';
import billingRoutes from './routes/billing.js';

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
