import express from 'express';
import User from '../models/User.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import upload from '../config/multer.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET: Search users (admin only)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  const search = req.query.search || '';

  try {
    const users = await User.find({ name: { $regex: search, $options: 'i' } });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// DELETE: Remove user by ID (admin only)
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// PUT: Update user by ID (admin only, image optional)
router.put('/users/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// POST: Create new user (admin only, role check enforced)
router.post('/users', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hash = await bcrypt.hash(password, 10);

    // Only allow 'admin' role if requester is also admin
    const userRole = role === 'admin' && req.user.role === 'admin' ? 'admin' : 'user';

    const userData = {
      name,
      email,
      password: hash,
      role: userRole,
      image: req.file ? req.file.filename : 'default.png'
    };

    const newUser = await User.create(userData);
    res.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

export default router;
