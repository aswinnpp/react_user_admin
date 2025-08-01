import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,  
  user: null,
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
      state.token = null;
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
    },
    setUser(state, action) {
      state.user = action.payload;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateImage,
  setUser
} = authSlice.actions;

export default authSlice.reducer;
