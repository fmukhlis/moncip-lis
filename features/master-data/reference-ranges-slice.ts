import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getLocalTestsWithReferenceRangesAction } from "./action/reference-ranges-action";

type LocalTest =
  | Awaited<
      ReturnType<typeof getLocalTestsWithReferenceRangesAction>
    >["data"][number]
  | null;

type ReferenceRangesState = {
  selectedLocalTest: LocalTest | null;
  referenceRangeType: "Both" | "Gendered";
  showConfigureReferenceRangesDialog: boolean;
};

const initialState: ReferenceRangesState = {
  selectedLocalTest: null,
  referenceRangeType: "Both",
  showConfigureReferenceRangesDialog: false,
};

const referenceRangesSlice = createSlice({
  name: "referenceRanges",
  initialState,
  reducers: {
    setSelectedLocalTest: (state, action: PayloadAction<LocalTest | null>) => {
      state.selectedLocalTest = action.payload;
    },
    setReferenceRangeType: (
      state,
      action: PayloadAction<"Both" | "Gendered">,
    ) => {
      state.referenceRangeType = action.payload;
    },
    setShowConfigureReferenceRangesDialog: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showConfigureReferenceRangesDialog = action.payload;
    },
  },
});

export const {
  setSelectedLocalTest,
  setReferenceRangeType,
  setShowConfigureReferenceRangesDialog,
} = referenceRangesSlice.actions;

export default referenceRangesSlice.reducer;
