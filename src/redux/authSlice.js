import { createSlice } from '@reduxjs/toolkit';

// No localStorage usage for token or user; JWT handled via HTTP-only cookies
const initialState = {
  token: null,  // Stored in HttpOnly cookie
  user: null,   // User info set on login, lost on refresh unless refetched
  loading: false,
  error: null
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
      state.token = null; // Cookie stores the JWT
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
      state.error = null;
    },
    updateImage(state, action) {
      if (state.user) {
        state.user.image = action.payload;
      }
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateImage
} = authSlice.actions;

export default authSlice.reducer;
