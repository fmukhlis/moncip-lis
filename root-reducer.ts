import userReducer from "@/features/user/user-slice";
import testPricingReducer from "@/features/master-data/test-pricing-slice";
import authenticationReducer from "@/features/authentication/authSlice";
import patientRegistryReducer from "@/features/operations/patient-registry/slice";
import referenceRangesReducer from "@/features/master-data/reference-ranges-slice";
import testAvailabilityReducer from "@/features/master-data/test-availability-slice";

import { serverFunctionSlice } from "./features/api/serverFunctionSlice";
import { combineReducers, createAction, PayloadAction } from "@reduxjs/toolkit";

export const resetApp = createAction("app/reset");

const appReducer = combineReducers({
  user: userReducer,
  testPricing: testPricingReducer,
  authentication: authenticationReducer,
  patientRegistry: patientRegistryReducer,
  referenceRanges: referenceRangesReducer,
  testAvailability: testAvailabilityReducer,
  [serverFunctionSlice.reducerPath]: serverFunctionSlice.reducer,
});

export const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: PayloadAction,
) => {
  if (action.type === resetApp.type) {
    state = undefined;
  }

  return appReducer(state, action);
};
