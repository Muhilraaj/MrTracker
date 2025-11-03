import {
  Typography, IconButton, Card, CardHeader, Menu,
  MenuItem
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from "react";
import type { DialogActionType, ToDoProps } from "../types/types";
import { actionStatusColorMap, DialogAction } from "../constants/constants";

export const ToDoCard = (props: ToDoProps) => {
  const { eventActionDTO } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const onAction = (type: DialogActionType, eventActionDTO: typeof props.eventActionDTO) => {
    props.onAction(type, eventActionDTO);
    handleMenuClose();
  }
  const isPending: boolean = eventActionDTO.status === 20;
  return (
    <Card sx={{ borderRadius: 2, border: 1, borderColor: actionStatusColorMap[eventActionDTO?.status || 10] }}>
      <CardHeader sx={{ pl: 4 }} title={<Typography
        variant="h6"
        fontWeight={200}
        sx={{
          textDecoration: isPending ? 'none' : 'line-through', // 👈 strikes the text
          color: actionStatusColorMap[eventActionDTO?.status || 10],
        }}
      >
        {eventActionDTO.prompt}
      </Typography>}
        action={<IconButton aria-label="settings" sx={{ pl: 4, color: actionStatusColorMap[eventActionDTO?.status || 10] }} onClick={handleMenuOpen}><MoreVertIcon /></IconButton>} />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {isPending && <MenuItem onClick={() => onAction(DialogAction.COMPLETE, eventActionDTO)}>Complete</MenuItem>}
        {isPending && <MenuItem onClick={() => onAction(DialogAction.CANCEL, eventActionDTO)}>Cancel</MenuItem>}
        {!isPending && <MenuItem onClick={() => onAction(DialogAction.REVERT, eventActionDTO)}>Revert</MenuItem>}
      </Menu>
    </Card>


  );
};
