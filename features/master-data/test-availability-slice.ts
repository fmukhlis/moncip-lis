import { MasterCategory } from "@/components/master-data/laboratory-test/test-availability/types";
import { RowSelectionState } from "@tanstack/react-table";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LabTests = MasterCategory["labTests"];

type TestAvailabilityState = {
  isDirty: boolean;
  mainTableRowSelection: RowSelectionState;
  selectedMasterLabTests: LabTests;
};

const initialState: TestAvailabilityState = {
  isDirty: false,
  mainTableRowSelection: {},
  selectedMasterLabTests: [],
};

const masterDataSlice = createSlice({
  initialState,
  name: "masterData",
  reducers: {
    setIsDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
    },
    setMainTableRowSelection: (
      state,
      action: PayloadAction<RowSelectionState>,
    ) => {
      state.mainTableRowSelection = action.payload;
    },
    selectMainTableRow: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((code) => {
        state.mainTableRowSelection[code] = true;
      });
    },
    unselectMainTableRow: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((code) => {
        delete state.mainTableRowSelection[code];
      });
    },
    setSelectedMasterLabTests: (state, action: PayloadAction<LabTests>) => {
      state.selectedMasterLabTests = action.payload;
    },
  },
});

export const {
  setIsDirty,
  selectMainTableRow,
  unselectMainTableRow,
  setMainTableRowSelection,
  setSelectedMasterLabTests,
} = masterDataSlice.actions;

export default masterDataSlice.reducer;
