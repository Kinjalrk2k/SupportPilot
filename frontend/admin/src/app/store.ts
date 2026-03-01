import { configureStore } from "@reduxjs/toolkit";
import layoutReducer from "./layoutSlice";
import flashbarReducer from "./flashbarSlice";

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    flashbar: flashbarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
