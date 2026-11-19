import { ThemeProvider } from '@emotion/react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import theme from '../../assets/theme';
import { EventSelectionActions } from '../../components/EventSelectionActions';
import { TrackerAppBar } from '../../components/TrackerAppBar';
import { useEventSelection } from '../../hooks/useEventSelection';
import { useMonthlyEventGrid } from '../../hooks/useMonthlyEventGrid';
import { MonthlyEventsTable } from './MonthlyEventsTable';

export const MonthlyTrackerView = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    dateKeys,
    rows,
    isLoading,
    canUpdateEvents,
    goToPreviousMonth,
    goToNextMonth,
  } = useMonthlyEventGrid();

  const todayKey = moment.utc().format('YYYY-MM-DD');
  const includesToday = dateKeys.includes(todayKey);
  const todaysEvents = rows.filter((row) => row.active).map((row) => ({
    actionId: row.actionId,
    status: row.cells[todayKey],
  }));
  const {
    selectedIds, isSaving, isSelectionDisabled, canCompleteOrCancel, canRevert, hasMixedSelection,
    toggleSelection, submitSelection,
  } = useEventSelection(includesToday ? todayKey : null, todaysEvents, isLoading || !canUpdateEvents);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, gap: 2 }} display="flex" flexDirection="column" alignItems="stretch">
        <TrackerAppBar title="Monthly Tracker" />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            p: { xs: 2, sm: 4 },
            bgcolor: 'background.paper',
            minHeight: '100vh',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <IconButton
                aria-label="Previous month"
                onClick={goToPreviousMonth}
                disabled={isSaving}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <DatePicker
                label="Month"
                views={['year', 'month']}
                openTo="month"
                value={selectedMonth}
                onChange={(newValue) => setSelectedMonth(newValue)}
                disabled={isSaving}
                format="MMMM yyyy"
                slotProps={{
                  textField: {
                    sx: { minWidth: 200 },
                  },
                }}
              />
              <IconButton
                aria-label="Next month"
                onClick={goToNextMonth}
                disabled={isSaving}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
            {includesToday && (
              <EventSelectionActions
                selectedIds={selectedIds}
                disabled={isSelectionDisabled}
                isSaving={isSaving}
                canCompleteOrCancel={canCompleteOrCancel}
                canRevert={canRevert}
                hasMixedSelection={hasMixedSelection}
                onSubmit={submitSelection}
              />
            )}
          </Paper>

          {!isLoading && (
            <MonthlyEventsTable
              rows={rows}
              dateKeys={dateKeys}
              todayKey={todayKey}
              selectedIds={selectedIds}
              disabled={isSelectionDisabled}
              onToggleSelection={toggleSelection}
            />
          )}

          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Box>

      </Box>
    </ThemeProvider>
  );
};
