import { Dialog, DialogContent,DialogActions,Button, IconButton, Typography } from "@mui/material";
import type { DialogWrapperProps } from "../types/types";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import type { DialogActionType, TaskStyle } from "../types/types";


export const dialogWrapperMapper: Record<DialogActionType, TaskStyle> = {
    'complete': { icon: <CheckCircleIcon color='success' sx={{ fontSize: 60 }}/>, color: 'success' },
    'cancel': { icon: <CancelIcon color='error' sx={{ fontSize: 60 }}/>, color: 'error' },
    'revert': { icon: <UndoIcon color='warning' sx={{ fontSize: 60 }}/>, color: 'warning' },
};


const DialogWrapper = ({type,isopen, task, onSubmit, onClose }: DialogWrapperProps) => {
  const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
  return (
    <Dialog open={isopen} onClose={onClose}>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', padding:4 }}>
        <IconButton sx={{ fontSize: 60 }}>
          {dialogWrapperMapper[type].icon}
        </IconButton>
        <Typography variant="h6" component="div">
          {capitalizeFirst(type)} this task?
        </Typography>
        <Typography variant="h6" component="div">
            {task}
        </Typography>
      </DialogContent>
      <DialogActions sx={{display:'flex', flexDirection:'row', justifyContent:'space-evenly', padding:2}}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} color={dialogWrapperMapper[type].color}>{type}</Button>
      </DialogActions>
    </Dialog>
  );
};
export default DialogWrapper;