import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PatientRegistryState = {
  selectedPatientId: string | null;
  localPatientsSource: "All" | "HIS" | "Local";
  showEditPatientDialog: boolean;
  showDeletePatientDialog: boolean;
};

const initialState: PatientRegistryState = {
  selectedPatientId: null,
  localPatientsSource: "All",
  showEditPatientDialog: false,
  showDeletePatientDialog: false,
};

const patientRegistrySlice = createSlice({
  name: "patientRegistry",
  initialState,
  reducers: {
    setSelectedPatientId: (state, action: PayloadAction<string | null>) => {
      state.selectedPatientId = action.payload;
    },
    setLocalPatientsSource: (
      state,
      action: PayloadAction<"All" | "HIS" | "Local">,
    ) => {
      state.localPatientsSource = action.payload;
    },
    setShowEditPatientDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditPatientDialog = action.payload;
    },
    setShowDeletePatientDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeletePatientDialog = action.payload;
    },
  },
});

export const {
  setSelectedPatientId,
  setLocalPatientsSource,
  setShowEditPatientDialog,
  setShowDeletePatientDialog,
} = patientRegistrySlice.actions;

export default patientRegistrySlice.reducer;
