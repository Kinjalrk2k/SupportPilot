import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "user";

interface AuthState {
  role: Role;
}

const getInitialRole = (): Role => {
  if (typeof window !== "undefined") {
    const savedRole = localStorage.getItem("supportpilot_role");
    if (savedRole === "admin" || savedRole === "user") {
      return savedRole;
    }
  }
  return "admin"; // Default to admin for now
};

const initialState: AuthState = {
  role: getInitialRole(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<Role>) => {
      state.role = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("supportpilot_role", action.payload);
      }
    },
  },
});

export const { setRole } = authSlice.actions;

export default authSlice.reducer;
