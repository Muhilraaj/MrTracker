import { configureStore } from "@reduxjs/toolkit";
import { actionApi } from "./api/action";
import { eventApi } from "./api/event";
import { authApi } from "./api/auth";
import snackbarReducer from "./slices/snackbarSlice";

const store = configureStore({
  reducer: {
    [actionApi.reducerPath]: actionApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    snackbar: snackbarReducer,
  },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([actionApi.middleware, eventApi.middleware, authApi.middleware]),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;