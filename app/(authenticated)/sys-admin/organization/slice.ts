import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type OrganizationState = {
  isEditUserDialogOpen: boolean;
  isCreateUserDialogOpen: boolean;
  isDeleteUserDialogOpen: boolean;
  isEditDepartmentDialogOpen: boolean;
  isCreateDepartmentDialogOpen: boolean;
};

const initialState: OrganizationState = {
  isEditUserDialogOpen: false,
  isCreateUserDialogOpen: false,
  isDeleteUserDialogOpen: false,
  isEditDepartmentDialogOpen: false,
  isCreateDepartmentDialogOpen: false,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setIsEditUserDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditUserDialogOpen = action.payload;
    },
    setIsCreateUserDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateUserDialogOpen = action.payload;
    },
    setIsDeleteUserDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isDeleteUserDialogOpen = action.payload;
    },
    setIsEditDepartmentDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditDepartmentDialogOpen = action.payload;
    },
    setIsCreateDepartmentDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isCreateDepartmentDialogOpen = action.payload;
    },
  },
});

export const {
  setIsEditUserDialogOpen,
  setIsCreateUserDialogOpen,
  setIsDeleteUserDialogOpen,
  setIsEditDepartmentDialogOpen,
  setIsCreateDepartmentDialogOpen,
} = organizationSlice.actions;

export default organizationSlice.reducer;
