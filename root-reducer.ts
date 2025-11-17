import userReducer from "@/features/user/user-slice";
import authenticationReducer from "@/features/authentication/authSlice";
import testAvailabilityReducer from "@/features/master-data/test-availability-slice";

import { combineReducers, createAction, PayloadAction } from "@reduxjs/toolkit";

export const resetApp = createAction("app/reset");

const appReducer = combineReducers({
  user: userReducer,
  authentication: authenticationReducer,
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
