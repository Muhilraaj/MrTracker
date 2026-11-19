import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';
import { isSelectableEventStatus } from '../constants/constants';
import { ACTION_NOT_APPLICABLE_STATUS } from '../utils/actionDate';

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
  readOnly?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onToggleSelection: () => void;
}

export const EventStatusCell = ({
  status,
  dateKey,
  prompt,
  isMobile = false,
  readOnly = false,
  disabled = false,
  selected = false,
  onToggleSelection,
}: EventStatusCellProps) => {
  const isPending = status === 20;
  const isNotApplicable = status === ACTION_NOT_APPLICABLE_STATUS;
  const cellDate = moment.utc(dateKey, 'YYYY-MM-DD');
  const isPastPending = isPending && cellDate.isBefore(moment.utc(), 'day');

  const badgeSize = isMobile ? 30 : 28;
  const iconSize = isMobile ? 18 : 16;
  const dashSize = isMobile ? 18 : 16;

  const indicator = isNotApplicable ? null : status === 30 ? (
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
          border: selected ? '1px solid' : '1px dashed',
          borderColor: selected ? 'primary.main' : 'divider',
          bgcolor: selected ? 'primary.main' : 'background.paper',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <CheckIcon sx={{ fontSize: iconSize }} />}
      </Box>
    );

  const formattedDate = cellDate.format('MMM D');
  const statusLabel = isNotApplicable
    ? 'Not applicable'
    : isPastPending
      ? 'Missed'
      : (STATUS_LABELS[status] ?? 'Unknown');
  const tooltipTitle = `${statusLabel}${selected ? ' (selected)' : ''} — ${formattedDate}`;

  const isInteractive = !readOnly && isSelectableEventStatus(status);

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
      {isInteractive ? (
        <IconButton
          aria-label={`${prompt} on ${formattedDate}, ${statusLabel}`}
          aria-pressed={selected}
          onClick={onToggleSelection}
          disabled={disabled}
          size="small"
          sx={{
            p: 0.25,
            borderRadius: '50%',
            ...(selected && { outline: '2px solid', outlineColor: 'primary.main' }),
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

  return isNotApplicable ? cellContent : <Tooltip title={tooltipTitle} arrow>{cellContent}</Tooltip>;
};
