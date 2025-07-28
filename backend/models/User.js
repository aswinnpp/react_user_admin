import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  image: { type: String, default: 'default.png' },
  role: { type: String, default: 'user' } 
});

export default mongoose.model('User', userSchema);
