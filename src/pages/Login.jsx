import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Login.css';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 401) {
          throw new Error('Invalid credentials. Please check your email and password.');
        } else if (res.status === 400) {
          throw new Error(data.message || 'Please check your input');
        } else if (data.message) {
          throw new Error(data.message);
        } else {
          throw new Error('Login failed. Please try again.');
        }
      }

      const token = data.token;
      const user = data.user; // Use the user data from backend response

      // Create user object with all necessary fields including image and role
      const userData = {
        name: user.name,
        id: user._id,
        role: user.role, // Store the role directly from database
        image: user.image || 'default.png', // Include the profile image
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      dispatch(loginSuccess({ token, user: userData }));

      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      dispatch(loginFailure(err.message));
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="register-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
