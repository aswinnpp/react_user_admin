import express from 'express';
import User from '../models/User.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import upload from '../config/multer.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  console.log('Admin route accessed');
  console.log('User from token:', req.user);
  const search = req.query.search || '';
  console.log('Search term:', search);
  try {
    const users = await User.find({ name: { $regex: search, $options: 'i' } });
    console.log('Found users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
});

router.put('/users/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If a new image was uploaded, update the image field
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

router.post('/users', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Hash the password
    const hash = await bcrypt.hash(password, 10);
    
    // Create user data
    const userData = {
      name,
      email,
      password: hash,
      role: role || 'user',
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
