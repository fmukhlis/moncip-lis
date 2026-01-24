import { getLabMembers } from "../lab/dal/query";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  selectedUser: Awaited<ReturnType<typeof getLabMembers>>[number] | null;
  showDeleteUserDialog: boolean;
  showUpdateUserDialog: boolean;
}

const initialState: UserState = {
  selectedUser: null,
  showDeleteUserDialog: false,
  showUpdateUserDialog: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setShowUpdateUserDialog: (state, action: PayloadAction<boolean>) => {
      state.showUpdateUserDialog = action.payload;
    },
    setShowDeleteUserDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteUserDialog = action.payload;
    },
    setSelectedUser: (
      state,
      action: PayloadAction<
        Awaited<ReturnType<typeof getLabMembers>>[number] | null
      >,
    ) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {
  setSelectedUser,
  setShowDeleteUserDialog,
  setShowUpdateUserDialog,
} = userSlice.actions;

export default userSlice.reducer;
