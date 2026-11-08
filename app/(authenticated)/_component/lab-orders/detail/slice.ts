import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LabOrderDetailState = {
  selectedSpecimenId: string | null;
  isCreateSpecimenDialogOpen: boolean;
  isCancelSpecimenDialogOpen: boolean;
  isReassignSpecimenDialogOpen: boolean;
  isReuseSpecimenDialogOpen: boolean;
  isCollectSpecimenDialogOpen: boolean;
  isReceiveSpecimenDialogOpen: boolean;
};

const initialState: LabOrderDetailState = {
  selectedSpecimenId: null,
  isCreateSpecimenDialogOpen: false,
  isCancelSpecimenDialogOpen: false,
  isReassignSpecimenDialogOpen: false,
  isReuseSpecimenDialogOpen: false,
  isCollectSpecimenDialogOpen: false,
  isReceiveSpecimenDialogOpen: false,
};

const labOrderDetailSlice = createSlice({
  name: "labOrderDetail",
  initialState,
  reducers: {
    setSelectedSpecimenId: (state, action: PayloadAction<string | null>) => {
      state.selectedSpecimenId = action.payload;
    },
    setIsCreateSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateSpecimenDialogOpen = action.payload;
    },
    setIsCancelSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCancelSpecimenDialogOpen = action.payload;
    },
    setIsReassignSpecimenDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isReassignSpecimenDialogOpen = action.payload;
    },
    setIsCollectSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCollectSpecimenDialogOpen = action.payload;
    },
    setIsReuseSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isReuseSpecimenDialogOpen = action.payload;
    },
    setIsReceiveSpecimenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isReceiveSpecimenDialogOpen = action.payload;
    },
  },
});

export const {
  setSelectedSpecimenId,
  setIsCreateSpecimenDialogOpen,
  setIsCancelSpecimenDialogOpen,
  setIsReassignSpecimenDialogOpen,
  setIsReuseSpecimenDialogOpen,
  setIsCollectSpecimenDialogOpen,
  setIsReceiveSpecimenDialogOpen,
} = labOrderDetailSlice.actions;

export default labOrderDetailSlice.reducer;
