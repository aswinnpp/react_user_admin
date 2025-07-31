// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token; 

  console.log('Token from cookie:', token);

  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log('JWT error:', err);
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

export const verifyAdmin = (req, res, next) => {
  console.log('Checking admin role for user:', req.user);
  console.log('User role:', req.user.role);
  if (req.user.role !== 'admin') {
    console.log('Access denied - not admin');
    return res.status(403).json({ msg: 'Not admin' });
  }
  console.log('Admin access granted');
  next();
};
