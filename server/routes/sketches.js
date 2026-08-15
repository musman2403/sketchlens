import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middleware/auth.js';
import Sketch from '../models/Sketch.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/sketches - Upload a new sketch
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, steps } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Upload to Cloudinary using a stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'sketchapp' },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary Error:', error);
          return res.status(500).json({ error: 'Image upload failed' });
        }

        try {
          // Save sketch to DB
          const sketch = await Sketch.create({
            userId: req.user.userId,
            title: title || 'Untitled Sketch',
            imageUrl: result.secure_url,
            steps: JSON.parse(steps || '[]')
          });

          res.status(201).json({ sketch });
        } catch (dbError) {
          console.error('Database Error:', dbError);
          res.status(500).json({ error: 'Failed to save sketch to database' });
        }
      }
    );

    // Stream the buffer to Cloudinary
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sketches/community - Get public sketches
router.get('/community', async (req, res) => {
  try {
    const sketches = await Sketch.find({ isPublic: true })
      .populate('userId', 'name') // Assuming User model has 'name' field
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ sketches });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sketches - Get user's sketches
router.get('/', requireAuth, async (req, res) => {
  try {
    const sketches = await Sketch.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ sketches });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/sketches/:id/publish - Toggle visibility
router.put('/:id/publish', requireAuth, async (req, res) => {
  try {
    const sketch = await Sketch.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!sketch) return res.status(404).json({ error: 'Sketch not found' });
    
    sketch.isPublic = !sketch.isPublic;
    await sketch.save();
    res.json({ sketch });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sketches/:id/like - Toggle like
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const sketch = await Sketch.findById(req.params.id);
    if (!sketch) return res.status(404).json({ error: 'Sketch not found' });

    const likeIndex = sketch.likes.indexOf(req.user.userId);
    if (likeIndex === -1) {
      sketch.likes.push(req.user.userId);
    } else {
      sketch.likes.splice(likeIndex, 1);
    }

    await sketch.save();
    res.json({ likesCount: sketch.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
