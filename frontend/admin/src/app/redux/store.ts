import { configureStore } from "@reduxjs/toolkit";
import layoutReducer from "./layoutSlice";
import flashbarReducer from "./flashbarSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    flashbar: flashbarReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
