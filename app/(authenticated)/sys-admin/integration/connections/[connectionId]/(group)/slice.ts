import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type IntegrationConnectionDetailSlice = {
  isRevokeTokenDialogOpen: boolean;
  isRotateTokenDialogOpen: boolean;
  selectedIntegrationTokenId: string | null;
  isRevokeCredentialDialogOpen: boolean;
  isRotateCredentialDialogOpen: boolean;
  selectedIntegrationCredentialId: string | null;
};

const initialState: IntegrationConnectionDetailSlice = {
  isRevokeTokenDialogOpen: false,
  isRotateTokenDialogOpen: false,
  selectedIntegrationTokenId: null,
  isRevokeCredentialDialogOpen: false,
  isRotateCredentialDialogOpen: false,
  selectedIntegrationCredentialId: null,
};

const integrationConnectionDetailSlice = createSlice({
  name: "integrationConnectionDetail",
  initialState,
  reducers: {
    setIsRevokeTokenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isRevokeTokenDialogOpen = action.payload;
    },
    setIsRotateTokenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isRotateTokenDialogOpen = action.payload;
    },
    setSelectedIntegrationTokenId: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.selectedIntegrationTokenId = action.payload;
    },
    setIsRevokeCredentialDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isRevokeCredentialDialogOpen = action.payload;
    },
    setIsRotateCredentialDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isRotateCredentialDialogOpen = action.payload;
    },
    setSelectedIntegrationCredentialId: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.selectedIntegrationCredentialId = action.payload;
    },
  },
});

export const {
  setIsRevokeTokenDialogOpen,
  setIsRotateTokenDialogOpen,
  setSelectedIntegrationTokenId,
  setIsRevokeCredentialDialogOpen,
  setIsRotateCredentialDialogOpen,
  setSelectedIntegrationCredentialId,
} = integrationConnectionDetailSlice.actions;

export default integrationConnectionDetailSlice.reducer;
