import { RowSelectionState } from "@tanstack/react-table";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TestPricingState = {
  // Local Test
  showLocalTests: "All" | "Active" | "Inactive" | "Orderable" | "Not Orderable";
  selectedLocalTestId: string | null;
  testPricingTableRowSelection: RowSelectionState;
  showMarkLocalTestOrderableDialog: boolean;
  showMarkLocalTestNotOrderableDialog: boolean;
  showConfigureLocalTestPricingDialog: boolean;

  // Local Test Group
  showLocalTestGroups:
    | "All"
    | "Active"
    | "Inactive"
    | "Orderable"
    | "Not Orderable";
  selectedLocalTestGroupId: string | null;
  showArchiveLocalTestGroupDialog: boolean;
  showUnarchiveLocalTestGroupDialog: boolean;
  showMarkLocalTestGroupOrderableDialog: boolean;
  showMarkLocalTestGroupNotOrderableDialog: boolean;
  showConfigureLocalTestGroupPricingDialog: boolean;
};

const initialState: TestPricingState = {
  // Local Test
  showLocalTests: "Active",
  selectedLocalTestId: null,
  testPricingTableRowSelection: {},
  showMarkLocalTestOrderableDialog: false,
  showMarkLocalTestNotOrderableDialog: false,
  showConfigureLocalTestPricingDialog: false,

  // Local Test Group
  showLocalTestGroups: "Active",
  selectedLocalTestGroupId: null,
  showArchiveLocalTestGroupDialog: false,
  showUnarchiveLocalTestGroupDialog: false,
  showMarkLocalTestGroupOrderableDialog: false,
  showMarkLocalTestGroupNotOrderableDialog: false,
  showConfigureLocalTestGroupPricingDialog: false,
};

const testPricingSlice = createSlice({
  name: "testPricing",
  initialState,
  reducers: {
    // Local Test
    setShowLocalTests: (
      state,
      action: PayloadAction<
        "All" | "Active" | "Inactive" | "Orderable" | "Not Orderable"
      >,
    ) => {
      state.showLocalTests = action.payload;
    },
    setSelectedLocalTestId: (state, action: PayloadAction<string | null>) => {
      state.selectedLocalTestId = action.payload;
    },
    setTestPricingTableRowSelection: (
      state,
      action: PayloadAction<RowSelectionState>,
    ) => {
      state.testPricingTableRowSelection = action.payload;
    },
    setShowMarkLocalTestOrderableDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showMarkLocalTestOrderableDialog = action.payload;
    },
    setShowMarkLocalTestNotOrderableDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showMarkLocalTestNotOrderableDialog = action.payload;
    },
    setShowConfigureLocalTestPricingDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showConfigureLocalTestPricingDialog = action.payload;
    },

    // Local Test Group
    setShowLocalTestGroups: (
      state,
      action: PayloadAction<
        "All" | "Active" | "Inactive" | "Orderable" | "Not Orderable"
      >,
    ) => {
      state.showLocalTestGroups = action.payload;
    },
    setSelectedLocalTestGroupId: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.selectedLocalTestGroupId = action.payload;
    },
    setShowArchiveLocalTestGroupDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showArchiveLocalTestGroupDialog = action.payload;
    },
    setShowUnarchiveLocalTestGroupDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showUnarchiveLocalTestGroupDialog = action.payload;
    },
    setShowMarkLocalTestGroupOrderableDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showMarkLocalTestGroupOrderableDialog = action.payload;
    },
    setShowMarkLocalTestGroupNotOrderableDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showMarkLocalTestGroupNotOrderableDialog = action.payload;
    },
    setShowConfigureLocalTestGroupPricingDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showConfigureLocalTestGroupPricingDialog = action.payload;
    },
  },
});

export const {
  setShowLocalTests,
  setShowLocalTestGroups,
  setSelectedLocalTestId,
  setSelectedLocalTestGroupId,
  setTestPricingTableRowSelection,
  setShowArchiveLocalTestGroupDialog,
  setShowMarkLocalTestOrderableDialog,
  setShowUnarchiveLocalTestGroupDialog,
  setShowConfigureLocalTestPricingDialog,
  setShowMarkLocalTestNotOrderableDialog,
  setShowMarkLocalTestGroupOrderableDialog,
  setShowConfigureLocalTestGroupPricingDialog,
  setShowMarkLocalTestGroupNotOrderableDialog,
} = testPricingSlice.actions;

export default testPricingSlice.reducer;
