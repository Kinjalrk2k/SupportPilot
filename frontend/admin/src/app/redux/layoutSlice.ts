import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface BreadcrumbItem {
  text: string;
  href: string;
}

interface LayoutState {
  breadcrumbs: BreadcrumbItem[];
  // pageHeader?: string;
  // pageDescription?: string;
}

const initialState: LayoutState = {
  breadcrumbs: [],
  // pageHeader: undefined,
  // pageDescription: undefined,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setPageLayout: (state, action: PayloadAction<LayoutState>) => {
      state.breadcrumbs = action.payload.breadcrumbs;
      // state.pageHeader = action.payload.pageHeader;
      // state.pageDescription = action.payload.pageDescription;
    },
    clearPageLayout: (state) => {
      state.breadcrumbs = [];
      // state.pageHeader = undefined;
      // state.pageDescription = undefined;
    },
  },
});

export const { setPageLayout, clearPageLayout } = layoutSlice.actions;

export default layoutSlice.reducer;
