import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  showSignoutDialog: boolean;
};

const initialState: AuthState = {
  showSignoutDialog: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setShowSignoutDialog: (state, action: PayloadAction<boolean>) => {
      state.showSignoutDialog = action.payload;
    },
  },
});

export const { setShowSignoutDialog } = authSlice.actions;

export default authSlice.reducer;
