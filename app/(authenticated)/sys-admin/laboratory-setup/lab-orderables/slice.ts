import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LabOrderablesState = {
  isOrderableDetailSheetOpen: boolean;
  isEditPerformableDialogOpen: boolean;
  selectedLisResultComponentId: string | null;
  isCreatePerformableDialogOpen: boolean;
  isEditResultComponentDialogOpen: boolean;
  resultComponentStatusDialogMode: "Activate" | "Deactivate";
  isResultComponentStatusDialogOpen: boolean;
  isCreateResultComponentDialogOpen: boolean;
};

const initialState: LabOrderablesState = {
  isOrderableDetailSheetOpen: false,
  isEditPerformableDialogOpen: false,
  selectedLisResultComponentId: null,
  isCreatePerformableDialogOpen: false,
  isEditResultComponentDialogOpen: false,
  resultComponentStatusDialogMode: "Activate",
  isCreateResultComponentDialogOpen: false,
  isResultComponentStatusDialogOpen: false,
};

const labOrderablesSlice = createSlice({
  name: "labOrderables",
  initialState,
  reducers: {
    setIsOrderableDetailSheetOpen: (state, action: PayloadAction<boolean>) => {
      state.isOrderableDetailSheetOpen = action.payload;
    },
    setIsEditPerformableDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditPerformableDialogOpen = action.payload;
    },
    setSelectedLisResultComponentId: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.selectedLisResultComponentId = action.payload;
    },
    setIsCreatePerformableDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isCreatePerformableDialogOpen = action.payload;
    },
    setIsEditResultComponentDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isEditResultComponentDialogOpen = action.payload;
    },
    setResultComponentStatusDialogMode: (
      state,
      action: PayloadAction<"Activate" | "Deactivate">,
    ) => {
      state.resultComponentStatusDialogMode = action.payload;
    },
    setIsCreateResultComponentDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isCreateResultComponentDialogOpen = action.payload;
    },
    setIsResultComponentStatusDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isResultComponentStatusDialogOpen = action.payload;
    },
  },
});

export const {
  setIsOrderableDetailSheetOpen,
  setIsEditPerformableDialogOpen,
  setSelectedLisResultComponentId,
  setIsCreatePerformableDialogOpen,
  setIsEditResultComponentDialogOpen,
  setResultComponentStatusDialogMode,
  setIsCreateResultComponentDialogOpen,
  setIsResultComponentStatusDialogOpen,
} = labOrderablesSlice.actions;

export default labOrderablesSlice.reducer;
