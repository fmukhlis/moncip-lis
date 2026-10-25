import organizationReducer from "@/app/(authenticated)/sys-admin/organization/slice";
import labOrderablesReducer from "@/app/(authenticated)/sys-admin/laboratory-setup/lab-orderables/slice";
import authenticationReducer from "@/app/(authenticated)/slice";
import labOrderDetailReducer from "@/app/(authenticated)/staff/lab-orders/[labOrderId]/slice";
import connectionSettingsReducer from "@/app/(authenticated)/sys-admin/integration/connections/slice";
import integrationConnectionDetailReducer from "@/app/(authenticated)/sys-admin/integration/connections/[connectionId]/(group)/slice";
import { serverFunctionSlice } from "./features/api/serverFunctionSlice";
import { combineReducers, createAction, PayloadAction } from "@reduxjs/toolkit";

export const resetApp = createAction("app/reset");

const appReducer = combineReducers({
  organization: organizationReducer,
  labOrderables: labOrderablesReducer,
  authentication: authenticationReducer,
  labOrderDetail: labOrderDetailReducer,
  connectionSettings: connectionSettingsReducer,
  integrationConnectionDetail: integrationConnectionDetailReducer,
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
