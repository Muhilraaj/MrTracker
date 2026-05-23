import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';
import { EventStatusCell } from '../../components/EventStatusCell';
import type { MonthlyRow } from '../../hooks/useMonthlyEventGrid';
import type { DialogActionType } from '../../types/types';

interface MonthlyEventsTableProps {
  rows: MonthlyRow[];
  dateKeys: string[];
  todayKey: string;
  onCellAction?: (actionId: string, prompt: string, dateKey: string, type: DialogActionType) => void;
}

const headerCellSx = {
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'text.secondary',
  borderBottom: '2px solid',
  borderColor: 'divider',
  py: 1.25,
};

export const MonthlyEventsTable = ({
  rows,
  dateKeys,
  todayKey,
  onCellAction,
}: MonthlyEventsTableProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const stickyShadow = 'inset -1px 0 0 rgba(0, 0, 0, 0.06), 4px 0 12px -6px rgba(0, 0, 0, 0.12)';

  const getDateCellBg = (key: string) => {
    if (key === todayKey) return 'rgba(0, 68, 255, 0.06)';
    return 'background.paper';
  };

  const getDateHeaderBg = (key: string) => {
    if (key === todayKey) return 'rgba(0, 68, 255, 0.08)';
    return 'background.paper';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
      }}
    >
      <TableContainer
        sx={{
          overflowX: 'auto',
          maxWidth: '100%',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Table size="small" stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  ...headerCellSx,
                  position: 'sticky',
                  left: 0,
                  zIndex: 4,
                  bgcolor: 'background.paper',
                  minWidth: isMobile ? 120 : 200,
                  boxShadow: stickyShadow,
                }}
              >
                Task
              </TableCell>
              {dateKeys.map((key) => {
                const day = moment.utc(key, 'YYYY-MM-DD');
                const isToday = key === todayKey;
                return (
                  <TableCell
                    key={key}
                    align="center"
                    sx={{
                      ...headerCellSx,
                      minWidth: isMobile ? 44 : 40,
                      width: isMobile ? 44 : 40,
                      px: isMobile ? 0.25 : 0.5,
                      bgcolor: getDateHeaderBg(key),
                      color: isToday ? 'secondary.main' : 'text.secondary',
                      fontWeight: isToday ? 700 : 600,
                      fontSize: isMobile ? '0.8rem' : '0.75rem',
                      textTransform: 'none',
                      letterSpacing: 0,
                      ...(isToday && {
                        borderBottom: '2px solid',
                        borderBottomColor: 'secondary.main',
                      }),
                    }}
                  >
                    {day.format('D')}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
                <TableRow
                  key={row.actionId}
                  hover
                  sx={{
                    bgcolor: 'background.paper',
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: 'rgba(0, 68, 255, 0.03)' },
                    '&:last-child td': { borderBottom: 0 },
                  }}
                >
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      bgcolor: 'background.paper',
                      minWidth: isMobile ? 120 : 200,
                      maxWidth: isMobile ? 120 : 240,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      boxShadow: stickyShadow,
                      py: isMobile ? 1 : 1.25,
                      transition: 'background-color 0.15s ease',
                      '.MuiTableRow-hover:hover &': { bgcolor: 'rgba(0, 68, 255, 0.03)' },
                    }}
                  >
                    <Tooltip title={row.prompt} arrow placement="right">
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          maxWidth: isMobile ? 110 : 220,
                          fontWeight: 500,
                          color: 'text.primary',
                        }}
                      >
                        {row.prompt}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  {dateKeys.map((key) => (
                    <TableCell
                      key={key}
                      align="center"
                      sx={{
                        minWidth: isMobile ? 44 : 40,
                        width: isMobile ? 44 : 40,
                        px: isMobile ? 0.25 : 0.5,
                        py: isMobile ? 0.5 : 0.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: getDateCellBg(key),
                        transition: 'background-color 0.15s ease',
                        ...(key === todayKey && {
                          boxShadow: 'inset 0 0 0 1px rgba(0, 68, 255, 0.12)',
                        }),
                      }}
                    >
                      <EventStatusCell
                        status={row.cells[key]}
                        dateKey={key}
                        prompt={row.prompt}
                        isMobile={isMobile}
                        onAction={
                          onCellAction
                            ? (type) => onCellAction(row.actionId, row.prompt, key, type)
                            : undefined
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 1.5, sm: 3 },
          justifyContent: 'center',
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'success.main',
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon sx={{ fontSize: 14 }} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Done
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'error.main',
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Not done
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 800, fontSize: 16, lineHeight: 1, px: 0.5 }}>
            —
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Missed
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
