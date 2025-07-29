import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

const initialState = {
  token: token || null,
  user: user ? JSON.parse(user) : null,
  loading: false,
  error: null,
  // Admin state
  users: [],
  adminLoading: false,
  adminError: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.loading = false;
      state.users = [];
      state.adminLoading = false;
      state.adminError = null;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear cookies
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    },
    updateImage(state, action) {
      if (state.user) {
        state.user.image = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    // Admin actions
    fetchUsersStart(state) {
      state.adminLoading = true;
      state.adminError = null;
    },
    fetchUsersSuccess(state, action) {
      state.adminLoading = false;
      state.users = action.payload;
    },
    fetchUsersFailure(state, action) {
      state.adminLoading = false;
      state.adminError = action.payload;
    },
    addUserStart(state) {
      state.adminLoading = true;
      state.adminError = null;
    },
    addUserSuccess(state, action) {
      state.adminLoading = false;
      state.users.push(action.payload);
    },
    addUserFailure(state, action) {
      state.adminLoading = false;
      state.adminError = action.payload;
    },
    updateUserStart(state) {
      state.adminLoading = true;
      state.adminError = null;
    },
    updateUserSuccess(state, action) {
      state.adminLoading = false;
      const index = state.users.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    updateUserFailure(state, action) {
      state.adminLoading = false;
      state.adminError = action.payload;
    },
    deleteUserStart(state) {
      state.adminLoading = true;
      state.adminError = null;
    },
    deleteUserSuccess(state, action) {
      state.adminLoading = false;
      state.users = state.users.filter(user => user._id !== action.payload);
    },
    deleteUserFailure(state, action) {
      state.adminLoading = false;
      state.adminError = action.payload;
    },
    clearAdminError(state) {
      state.adminError = null;
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateImage,
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  addUserStart,
  addUserSuccess,
  addUserFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  clearAdminError
} = authSlice.actions;

export default authSlice.reducer;
