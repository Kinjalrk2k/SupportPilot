import { createSlice, type PayloadAction, nanoid } from "@reduxjs/toolkit";

export type FlashType = "success" | "error" | "info" | "warning";

export interface FlashMessage {
  id: string;
  type: FlashType;
  content: string;
  header?: string;
  dismissible?: boolean;
  loading?: boolean;
}

interface FlashbarState {
  items: FlashMessage[];
}

const initialState: FlashbarState = {
  items: [],
};

const flashbarSlice = createSlice({
  name: "flashbar",
  initialState,
  reducers: {
    addFlash: {
      reducer: (state, action: PayloadAction<FlashMessage>) => {
        state.items.push(action.payload);
      },
      prepare: (flash: Omit<FlashMessage, "id">) => ({
        payload: {
          id: nanoid(),
          dismissible: true,
          ...flash,
        },
      }),
    },

    removeFlash: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    clearFlashes: (state) => {
      state.items = [];
    },

    updateFlash: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<FlashMessage>;
      }>,
    ) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.changes,
        };
      }
    },
  },
});

export const { addFlash, removeFlash, clearFlashes, updateFlash } =
  flashbarSlice.actions;

export default flashbarSlice.reducer;
