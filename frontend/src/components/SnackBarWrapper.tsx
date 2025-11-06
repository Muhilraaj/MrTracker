// src/App.tsx
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import { hideSnackbar } from "../stores/slices/snackbarSlice";
import type { RootState } from "../stores/store";

function SnackbarWrapper() {
  const dispatch = useDispatch();
  const snackbar = useSelector((state: RootState) => state.snackbar);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={snackbar.type}
        onClose={() => dispatch(hideSnackbar())}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}

export default SnackbarWrapper;
