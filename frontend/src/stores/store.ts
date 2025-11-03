import { configureStore } from "@reduxjs/toolkit";
import { actionApi } from "./api/action";
import { eventApi } from "./api/event";

const store = configureStore({
  reducer: {
    [actionApi.reducerPath]: actionApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
  },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([actionApi.middleware, eventApi.middleware]),
});

export default store;