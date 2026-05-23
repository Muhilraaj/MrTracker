import { ThemeProvider } from '@emotion/react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import moment from 'moment';
import theme from '../../assets/theme';
import DialogWrapper from '../../components/DialogWrapper';
import { TrackerAppBar } from '../../components/TrackerAppBar';
import { DialogAction } from '../../constants/constants';
import { useMonthlyEventGrid } from '../../hooks/useMonthlyEventGrid';
import { usePostEventMutation } from '../../stores/api/event';
import { showSnackbar } from '../../stores/slices/snackbarSlice';
import type { DialogActionType } from '../../types/types';
import { MonthlyEventsTable } from './MonthlyEventsTable';

export const MonthlyTrackerView = () => {
  const dispatch = useDispatch();
  const {
    selectedMonth,
    setSelectedMonth,
    dateKeys,
    rows,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
  } = useMonthlyEventGrid();

  const [postEvent, { isLoading: isPosting }] = usePostEventMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<DialogActionType>(DialogAction.COMPLETE);
  const [pendingUpdate, setPendingUpdate] = useState<{
    actionId: string;
    prompt: string;
    dateKey: string;
    status: number;
  } | null>(null);

  const todayKey = moment.utc().format('YYYY-MM-DD');
  const isBusy = isLoading || isPosting;

  const handleCellAction = (
    actionId: string,
    prompt: string,
    dateKey: string,
    type: DialogActionType
  ) => {
    const status =
      type === DialogAction.COMPLETE ? 30 : type === DialogAction.CANCEL ? 10 : 20;
    setDialogType(type);
    setPendingUpdate({ actionId, prompt, dateKey, status });
    setOpenDialog(true);
  };

  const onSubmitDialog = async () => {
    if (!pendingUpdate) return;

    try {
      await postEvent({
        actionId: pendingUpdate.actionId,
        status: pendingUpdate.status,
        eventDate: moment.utc(pendingUpdate.dateKey, 'YYYY-MM-DD').toDate(),
      }).unwrap();
      setOpenDialog(false);
      setPendingUpdate(null);
      dispatch(showSnackbar({ message: 'Event updated successfully', type: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Failed to update event', type: 'error' }));
    }
  };

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
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexWrap: 'wrap',
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <IconButton
              aria-label="Previous month"
              onClick={goToPreviousMonth}
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
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Paper>

          {!isBusy && (
            <MonthlyEventsTable
              rows={rows}
              dateKeys={dateKeys}
              todayKey={todayKey}
              onCellAction={handleCellAction}
            />
          )}

          {isBusy && (
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

        <DialogWrapper
          type={dialogType}
          isopen={openDialog}
          onSubmit={onSubmitDialog}
          task={pendingUpdate?.prompt ?? ''}
          onClose={() => {
            setOpenDialog(false);
            setPendingUpdate(null);
          }}
        />
      </Box>
    </ThemeProvider>
  );
};
