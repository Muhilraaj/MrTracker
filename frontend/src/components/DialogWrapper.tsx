import { useId, type ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { eventActionAppearance } from '../constants/constants';
import type { DialogActionType } from '../types/types';


interface DialogWrapperProps {
  action: DialogActionType;
  open: boolean;
  subject: string;
  children?: ReactNode;
  confirmDisabled?: boolean;
  onSubmit: () => void;
  onClose: () => void;
}


const DialogWrapper = ({
  action, open, subject, children, confirmDisabled = false, onSubmit, onClose,
}: DialogWrapperProps) => {
  const titleId = useId();
  const { label, color } = eventActionAppearance[action];

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby={titleId} fullWidth maxWidth="xs">
      <DialogTitle id={titleId}>{label} {subject}?</DialogTitle>
      {children && <DialogContent>{children}</DialogContent>}
      <DialogActions>
        <Button autoFocus onClick={onClose}>Go back</Button>
        <Button variant="contained" color={color} disabled={confirmDisabled} onClick={onSubmit}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogWrapper;
