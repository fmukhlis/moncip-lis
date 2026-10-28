import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LabOrderDetailState = {
  selectedSpecimenId: string | null;
  isEditSpecimenDialogOpen: boolean;
  isCancelSpecimenDialogOpen: boolean;
  isCreateSpecimenDialogOpen: boolean;
  isCollectSpecimenDialogOpen: boolean;
};

const initialState: LabOrderDetailState = {
  selectedSpecimenId: null,
  isEditSpecimenDialogOpen: false,
  isCancelSpecimenDialogOpen: false,
  isCreateSpecimenDialogOpen: false,
  isCollectSpecimenDialogOpen: false,
};

const labOrderDetailSlice = createSlice({
  name: "labOrderDetail",
  initialState,
  reducers: {
    setSelectedSpecimenId: (state, action: PayloadAction<string | null>) => {
      state.selectedSpecimenId = action.payload;
    },
    setIsEditSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditSpecimenDialogOpen = action.payload;
    },
    setIsCancelSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCancelSpecimenDialogOpen = action.payload;
    },
    setIsCreateSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateSpecimenDialogOpen = action.payload;
    },
    setIsCollectSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCollectSpecimenDialogOpen = action.payload;
    },
  },
});

export const {
  setSelectedSpecimenId,
  setIsEditSpecimenDialogOpen,
  setIsCancelSpecimenDialogOpen,
  setIsCreateSpecimenDialogOpen,
  setIsCollectSpecimenDialogOpen,
} = labOrderDetailSlice.actions;

export default labOrderDetailSlice.reducer;
