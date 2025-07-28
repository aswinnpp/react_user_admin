

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {verifyToken, } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  res.json(user);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const valid = user && await bcrypt.compare(password, user.password);

  if (!valid) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ 
    id: user._id, 
    role: user.role,
    name: user.name 
  }, process.env.JWT_SECRET || 'jwtsecret');
  res.json({ token, user });
});


router.get('/profile', verifyToken, async (req, res) => {
  res.json({ message: `Hi ${req.user.name}, welcome to your profile!` });
});


export default router;









