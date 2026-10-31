import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface UiState {
  isAuthModalOpen: boolean;
  isChatDrawerOpen: boolean;
  selectedEventId: string | null;
  activePersona: string;
}

const initialState: UiState = {
  isAuthModalOpen: false,
  isChatDrawerOpen: false,
  selectedEventId: null,
  activePersona: "Celebration Concierge",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    setChatDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatDrawerOpen = action.payload;
    },
    setSelectedEventId: (state, action: PayloadAction<string | null>) => {
      state.selectedEventId = action.payload;
    },
    setActivePersona: (state, action: PayloadAction<string>) => {
      state.activePersona = action.payload;
    },
  },
});

export const { setAuthModalOpen, setChatDrawerOpen, setSelectedEventId, setActivePersona } =
  uiSlice.actions;

export default uiSlice.reducer;
