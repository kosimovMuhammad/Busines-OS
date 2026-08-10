import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse, Company, User } from "@/types/api";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  company: Company | null;
  initialized: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  company: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.initialized = true;
    },
    setCompany: (state, action: PayloadAction<Company>) => {
      state.company = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    sessionCheckFailed: (state) => {
      state.accessToken = null;
      state.user = null;
      state.company = null;
      state.initialized = true;
    },
    clearAuth: () => initialState,
  },
});

export const { setCredentials, setCompany, updateUser, sessionCheckFailed, clearAuth } =
  authSlice.actions;
export default authSlice.reducer;
