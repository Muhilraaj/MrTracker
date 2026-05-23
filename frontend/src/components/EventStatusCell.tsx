import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import moment from 'moment';
import { DialogAction } from '../constants/constants';
import type { DialogActionType } from '../types/types';

const STATUS_LABELS: Record<number, string> = {
  10: 'Cancelled',
  20: 'Pending',
  30: 'Completed',
};

interface EventStatusCellProps {
  status: number;
  dateKey: string;
  prompt: string;
  isMobile?: boolean;
  onAction?: (type: DialogActionType) => void;
}

export const EventStatusCell = ({ status, dateKey, prompt, isMobile = false, onAction }: EventStatusCellProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const isPending = status === 20;
  const cellDate = moment.utc(dateKey, 'YYYY-MM-DD');
  const isPastPending = isPending && cellDate.isBefore(moment.utc(), 'day');

  const badgeSize = isMobile ? 30 : 28;
  const iconSize = isMobile ? 18 : 16;
  const dashSize = isMobile ? 18 : 16;

  const indicator =
    status === 30 ? (
      <Box
        sx={{
          width: badgeSize,
          height: badgeSize,
          borderRadius: '50%',
          bgcolor: 'success.main',
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.35)',
        }}
      >
        <CheckIcon sx={{ fontSize: iconSize }} />
      </Box>
    ) : status === 10 ? (
      <Box
        sx={{
          width: badgeSize,
          height: badgeSize,
          borderRadius: '50%',
          bgcolor: 'error.main',
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(211, 47, 47, 0.35)',
        }}
      >
        <CloseIcon sx={{ fontSize: iconSize }} />
      </Box>
    ) : isPastPending ? (
      <Box
        sx={{
          width: badgeSize,
          height: badgeSize,
          borderRadius: '50%',
          bgcolor: 'background.paper',
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: dashSize, lineHeight: 1 }}>—</Typography>
      </Box>
    ) : (
      <Box
        sx={{
          width: badgeSize,
          height: badgeSize,
          borderRadius: '50%',
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      />
    );

  const formattedDate = cellDate.format('MMM D');
  const statusLabel = isPastPending ? 'Missed' : (STATUS_LABELS[status] ?? 'Unknown');
  const tooltipTitle = `${statusLabel} — ${formattedDate}`;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!onAction) return;
    setAnchorEl(event.currentTarget);
  };

  const handleMenuAction = (type: DialogActionType) => {
    onAction?.(type);
    setAnchorEl(null);
  };

  const cellContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: isMobile ? 40 : 44,
        height: isMobile ? 40 : 44,
        mx: 'auto',
      }}
    >
      {onAction ? (
        <IconButton
          aria-label={`${prompt} on ${formattedDate}`}
          onClick={handleClick}
          size="small"
          sx={{
            p: 0.25,
            borderRadius: '50%',
            transition: 'transform 0.15s ease, background-color 0.15s ease',
            '&:hover': {
              transform: 'scale(1.08)',
              bgcolor: 'action.hover',
            },
          }}
        >
          {indicator}
        </IconButton>
      ) : (
        indicator
      )}
    </Box>
  );

  return (
    <>
      <Tooltip title={tooltipTitle} arrow>
        {cellContent}
      </Tooltip>
      {onAction && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          slotProps={{
            paper: {
              sx: { borderRadius: 2, minWidth: 140, boxShadow: 3 },
            },
          }}
        >
          {isPending && (
            <MenuItem onClick={() => handleMenuAction(DialogAction.COMPLETE)}>Complete</MenuItem>
          )}
          {isPending && (
            <MenuItem onClick={() => handleMenuAction(DialogAction.CANCEL)}>Cancel</MenuItem>
          )}
          {!isPending && (
            <MenuItem onClick={() => handleMenuAction(DialogAction.REVERT)}>Revert</MenuItem>
          )}
        </Menu>
      )}
    </>
  );
};
