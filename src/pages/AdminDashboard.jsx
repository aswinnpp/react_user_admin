import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { token } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', image: null });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ name: '', email: '', role: 'user', image: null });
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch all users error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users by search
  const fetchSearchedUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/users?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch searched users error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // On mount, fetch all users
  useEffect(() => {
    fetchAllUsers();
    // eslint-disable-next-line
  }, []);

  // When search changes, fetch by search if search is not empty, else fetch all
  useEffect(() => {
    if (search.trim() === '') {
      fetchAllUsers();
    } else {
      fetchSearchedUsers();
    }
    // eslint-disable-next-line
  }, [search]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.entries(newUser).forEach(([key, val]) => {
      if (val !== null) formData.append(key, val);
    });

    try {
      await axios.post('http://localhost:5000/api/admin/users', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewUser({ name: '', email: '', password: '', role: 'user', image: null });
      setShowAddForm(false);
      fetchAllUsers();
    } catch (err) {
      console.error('Create error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAllUsers();
      } catch (err) {
        console.error('Delete error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user._id);
    setEditUserData({ 
      name: user.name, 
      email: user.email, 
      role: user.role,
      image: null 
    });
    setEditPreviewUrl(null);
  };

  const handleUpdateUser = async (id) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(editUserData).forEach(([key, val]) => {
        if (val !== null) formData.append(key, val);
      });

      await axios.put(`http://localhost:5000/api/admin/users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setEditingUserId(null);
      setEditPreviewUrl(null);
      fetchAllUsers();
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditUserData({ name: '', email: '', role: 'user', image: null });
    setEditPreviewUrl(null);
  };

  const handleImageClick = () => {
    if (editingUserId && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setEditUserData({ ...editUserData, image: selected });
      
      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const getDisplayImage = (user) => {
    if (editingUserId === user._id && editPreviewUrl) {
      return editPreviewUrl;
    }
    return `http://localhost:5000/uploads/${user.image || 'default.png'}`;
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button 
          className="add-user-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {showAddForm && (
        <div className="add-user-form">
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                required
                className="form-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                required
                className="form-input"
              />
            </div>
            <div className="form-row">
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                required
                className="form-input"
              />
              <select
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                className="form-select"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-row">
              <input
                type="file"
                onChange={e => setNewUser({ ...newUser, image: e.target.files[0] })}
                className="form-file"
                accept="image/*"
              />
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-section">
        <h3>Users ({users.length})</h3>
        {loading && <div className="loading">Loading...</div>}
        
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    {editingUserId === user._id ? (
                      <div className="image-edit-container">
                        <img
                          src={getDisplayImage(user)}
                          alt={user.name}
                          className="user-image clickable"
                          onClick={handleImageClick}
                          title="Click to change image"
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleImageChange}
                          className="hidden-file-input"
                          accept="image/*"
                        />
                      </div>
                    ) : (
                      <img
                        src={`http://localhost:5000/uploads/${user.image || 'default.png'}`}
                        alt={user.name}
                        className="user-image"
                      />
                    )}
                  </td>
                  <td>
                    {editingUserId === user._id ? (
                      <input
                        type="text"
                        value={editUserData.name}
                        onChange={e => setEditUserData({ ...editUserData, name: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td>
                    {editingUserId === user._id ? (
                      <input
                        type="email"
                        value={editUserData.email}
                        onChange={e => setEditUserData({ ...editUserData, email: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingUserId === user._id ? (
                      <select
                        value={editUserData.role}
                        onChange={e => setEditUserData({ ...editUserData, role: e.target.value })}
                        className="edit-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    )}
                  </td>
                  <td>
                    {editingUserId === user._id ? (
                      <div className="edit-actions">
                        <button 
                          onClick={() => handleUpdateUser(user._id)} 
                          className="save-btn"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          onClick={cancelEdit} 
                          className="cancel-btn"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button 
                          onClick={() => startEdit(user)} 
                          className="edit-btn"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)} 
                          className="delete-btn"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
