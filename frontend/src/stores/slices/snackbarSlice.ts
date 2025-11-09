import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type SnackbarState = {
  open: boolean;
  message: string;
  type: "success" | "error";
};

const initialState: SnackbarState = {
  open: false,
  message: "",
  type: "success",
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    showSnackbar: (
      state,
      action: PayloadAction<{ message: string; type?: "success" | "error" }>
    ) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type ?? "success";
    },
    hideSnackbar: (state) => {
      state.open = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
