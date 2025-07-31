import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/adminRoutes.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';





dotenv.config();


connectDB();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true               
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads'));



app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);


app.listen(5000, () => console.log('Server running on port 5000'));



