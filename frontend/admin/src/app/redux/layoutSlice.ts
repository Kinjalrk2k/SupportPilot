import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface BreadcrumbItem {
  text: string;
  href: string;
}

interface LayoutState {
  breadcrumbs: BreadcrumbItem[];
  activeHref: string;
  toolsOpen: boolean;
  helpPanelTopic: string;
}

const initialState: LayoutState = {
  breadcrumbs: [],
  activeHref: "",
  toolsOpen: false,
  helpPanelTopic: "default",
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setPageLayout: (state, action: PayloadAction<Partial<LayoutState>>) => {
      if (action.payload.breadcrumbs !== undefined) {
        state.breadcrumbs = action.payload.breadcrumbs;
      }
      if (action.payload.activeHref !== undefined) {
        state.activeHref = action.payload.activeHref;
      }
      if (action.payload.helpPanelTopic !== undefined) {
        state.helpPanelTopic = action.payload.helpPanelTopic;
      }
    },
    clearPageLayout: (state) => {
      state.breadcrumbs = [];
      state.activeHref = "";
      state.helpPanelTopic = "default";
    },
    setToolsOpen: (state, action: PayloadAction<boolean>) => {
      state.toolsOpen = action.payload;
    },
  },
});

export const { setPageLayout, clearPageLayout, setToolsOpen } = layoutSlice.actions;

export default layoutSlice.reducer;
