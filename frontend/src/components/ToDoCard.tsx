import {
  Typography, IconButton, Card, CardActionArea, Menu,
  MenuItem
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from "react";
import type { DialogActionType, ToDoProps } from "../types/types";
import { actionStatusColorMap, DialogAction, isSelectableEventStatus, priorityActionStyles } from "../constants/constants";

export const ToDoCard = (props: ToDoProps) => {
  const { eventActionDTO, selected, onToggleSelection, disabled } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const isPriority = eventActionDTO.priority;
  const statusColor = actionStatusColorMap[eventActionDTO?.status || 10];

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
  const header = (
    <Typography
      component="span"
      variant="h6"
      fontWeight={isPriority ? priorityActionStyles.fontWeight : 200}
      sx={{
        display: 'block',
        pl: 4,
        pr: 2,
        py: 2,
        textDecoration: isPending ? 'none' : 'line-through',
        color: statusColor,
      }}
    >
      {eventActionDTO.prompt}
    </Typography>
  );

  return (
    <Card sx={{
      display: 'flex',
      borderRadius: 2,
      border: isPriority
        ? `${priorityActionStyles.borderWidth}px solid ${priorityActionStyles.edgeColor}`
        : 1,
      borderColor: selected ? 'primary.main' : isPriority ? priorityActionStyles.edgeColor : statusColor,
      bgcolor: selected ? 'action.selected' : isPriority ? priorityActionStyles.bgcolor : undefined,
      boxShadow: selected ? (theme) => `0 0 0 1px ${theme.palette.primary.main}` : undefined,
    }}>
      {isSelectableEventStatus(eventActionDTO.status) ? (
        <CardActionArea aria-pressed={selected} onClick={onToggleSelection} disabled={disabled}>
          {header}
        </CardActionArea>
      ) : header}
      <IconButton
        aria-label={`Actions for ${eventActionDTO.prompt}`}
        sx={{ alignSelf: 'center', mr: 1, color: statusColor }}
        onClick={handleMenuOpen}
        disabled={disabled}
      >
        <MoreVertIcon />
      </IconButton>
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
