import userReducer from "@/features/user/userSlice";
import authenticationReducer from "@/features/authentication/authSlice";

import { combineReducers, createAction, PayloadAction } from "@reduxjs/toolkit";

export const resetApp = createAction("app/reset");

const appReducer = combineReducers({
  user: userReducer,
  authentication: authenticationReducer,
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
