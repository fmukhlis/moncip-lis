import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ConnectionSettingsSlice = {
  isRevokeTokenDialogOpen: boolean;
  isRotateTokenDialogOpen: boolean;
  connectionStatusDialogMode: "Activate" | "Deactivate";
  selectedIntegrationTokenId: string | null;
  isConnectionStatusDialogOpen: boolean;
  isRevokeCredentialDialogOpen: boolean;
  isRotateCredentialDialogOpen: boolean;
  selectedIntegrationConnectionId: string | null;
  selectedIntegrationCredentialId: string | null;
};

const initialState: ConnectionSettingsSlice = {
  isRevokeTokenDialogOpen: false,
  isRotateTokenDialogOpen: false,
  connectionStatusDialogMode: "Activate",
  selectedIntegrationTokenId: null,
  isConnectionStatusDialogOpen: false,
  isRevokeCredentialDialogOpen: false,
  isRotateCredentialDialogOpen: false,
  selectedIntegrationConnectionId: null,
  selectedIntegrationCredentialId: null,
};

const connectionSettingsSlice = createSlice({
  name: "connectionSettings",
  initialState,
  reducers: {
    setIsRevokeTokenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isRevokeTokenDialogOpen = action.payload;
    },
    setIsRotateTokenDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isRotateTokenDialogOpen = action.payload;
    },
    setConnectionStatusDialogMode: (
      state,
      action: PayloadAction<"Activate" | "Deactivate">,
    ) => {
      state.connectionStatusDialogMode = action.payload;
    },
    setSelectedIntegrationTokenId: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.selectedIntegrationTokenId = action.payload;
    },
    setIsConnectionStatusDialogOpen: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isConnectionStatusDialogOpen = action.payload;
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
    setSelectedIntegrationConnectionId: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.selectedIntegrationConnectionId = action.payload;
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
  setConnectionStatusDialogMode,
  setSelectedIntegrationTokenId,
  setIsConnectionStatusDialogOpen,
  setIsRevokeCredentialDialogOpen,
  setIsRotateCredentialDialogOpen,
  setSelectedIntegrationConnectionId,
  setSelectedIntegrationCredentialId,
} = connectionSettingsSlice.actions;

export default connectionSettingsSlice.reducer;
