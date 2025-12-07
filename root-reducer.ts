import userReducer from "@/features/user/user-slice";
import authenticationReducer from "@/features/authentication/authSlice";
import referenceRangesReducer from "@/features/master-data/reference-ranges-slice";
import testAvailabilityReducer from "@/features/master-data/test-availability-slice";

import { combineReducers, createAction, PayloadAction } from "@reduxjs/toolkit";

export const resetApp = createAction("app/reset");

const appReducer = combineReducers({
  user: userReducer,
  authentication: authenticationReducer,
  referenceRanges: referenceRangesReducer,
  testAvailability: testAvailabilityReducer,
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
