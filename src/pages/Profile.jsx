import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";
import { updateImage, logout } from "../redux/authSlice";

export default function Profile() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  // Initialize profile image from Redux store
  useEffect(() => {
    if (user?.image) {
      setProfileImage(`http://localhost:5000/uploads/${user.image}`);
    } else {
      setProfileImage(`http://localhost:5000/uploads/default.png`);
    }
  }, [user?.image]);

  // Fetch the latest profile image from the DB only if needed
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/profile/image',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          }
        );
        if (response.data && response.data.image) {
          setProfileImage(`http://localhost:5000/uploads/${response.data.image}`);
          dispatch(updateImage(response.data.image));
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
        // Keep the current image from Redux store if fetch fails
      }
    };

    // Only fetch if we don't have an image in Redux store
    if (!user?.image || user.image === 'default.png') {
      fetchProfileImage();
    }
  }, [user?.image, dispatch]);

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setSuccess("");
      
      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.put(
        'http://localhost:5000/api/profile/uploads',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (response.data && response.data.image) {
        dispatch(updateImage(response.data.image));
        setProfileImage(`http://localhost:5000/uploads/${response.data.image}`);
        setSuccess('Image uploaded successfully!');
        setFile(null);
        setPreviewUrl(""); // Clear preview after successful upload
      }
    } catch (error) {
      setSuccess('Failed to upload image.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Determine which image to display
  const displayImage = previewUrl || profileImage || `http://localhost:5000/uploads/default.png`;

  return (
    <div className="profile-container">
      <h2 className="h2">Welcome, {user?.name}</h2>

      <label htmlFor="fileInput">
        <img
          className="profile-img"
          src={displayImage}
          alt="Profile"
        />
      </label>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      <button className="upload-btn" onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {success && <p className="success">{success}</p>}

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
