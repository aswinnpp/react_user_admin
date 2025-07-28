import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// ✅ Route to get profile image
router.get('/image', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ image: user.image || 'default.png' });
  } catch (err) {
    console.error('Error fetching profile image:', err);
    res.status(500).json({ message: 'Failed to fetch profile image' });
  }
});

// ✅ Route to update profile image
router.put('/uploads', verifyToken, upload.single('image'), async (req, res) => {
  try {

    const updatedUser = await User.findByIdAndUpdate(
      req.userId, // ✅ Comes from middleware
      { image: req.file.filename },
      { new: true }
    );

    res.json({ image: updatedUser.image });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

export default router;
