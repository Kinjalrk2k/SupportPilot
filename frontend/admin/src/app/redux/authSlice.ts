import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "user";

interface AuthState {
  role: Role;
}

const initialState: AuthState = {
  role: "admin", // Default to admin for now
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<Role>) => {
      state.role = action.payload;
    },
  },
});

export const { setRole } = authSlice.actions;

export default authSlice.reducer;
