import { rootReducer } from "./root-reducer";
import { configureStore } from "@reduxjs/toolkit";
import { serverFunctionSlice } from "./features/api/serverFunctionSlice";

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(serverFunctionSlice.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
