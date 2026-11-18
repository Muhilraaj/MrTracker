import { ThemeProvider } from "@emotion/react";
import { useGetActionsQuery } from "../../stores/api/action";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import theme from '../../assets/theme';
import Box from "@mui/material/Box";
import { EventSelectionActions } from "../../components/EventSelectionActions";
import { TrackerAppBar } from "../../components/TrackerAppBar";
import { ToDoCard } from "../../components/ToDoCard";
import DialogWrapper from "../../components/DialogWrapper";
import { useState } from "react";
import type { DialogActionType } from "../../types/types";
import { DialogAction } from "../../constants/constants";
import { useEventSelection } from "../../hooks/useEventSelection";
import { useGetEventsQuery, usePostEventMutation } from "../../stores/api/event";
import moment from "moment";
import type { EventActionDTO } from "../../types/types";
import { isActionVisibleOnDate } from "../../utils/actionDate";
import { Grid } from "@mui/material";
import { showSnackbar } from "../../stores/slices/snackbarSlice";
import { useDispatch } from "react-redux";
import CircularProgress from '@mui/material/CircularProgress';

export const DailyTrackerForm = () => {
    const dateUTC = moment.utc();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const selectedDateUTC = moment.utc(
        moment(selectedDate ?? new Date()).format('YYYY-MM-DD'),
        'YYYY-MM-DD'
    );
    const selectedDateKey = selectedDateUTC.format('YYYY-MM-DD');
    const minSelectableDate = dateUTC.clone().subtract(6, "days").toDate();
    const maxSelectableDate = dateUTC.clone().toDate();
    const { currentData: activeActions, isFetching: isFetchingActions } = useGetActionsQuery({
        active: true,
        asOfDate: selectedDateKey,
    });
    const { currentData: events, isFetching: isFetchingEvents } = useGetEventsQuery({
        startDate: selectedDateUTC.clone().startOf('day').toISOString(),
        endDate: selectedDateUTC.clone().endOf('day').toISOString()
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<DialogActionType>(DialogAction.COMPLETE);
    const [selectedEventAction, setSelectedEventAction] = useState<EventActionDTO | null>(null);
    const [postEvent,{ isLoading: isLoadingPostEvent }] = usePostEventMutation();
    const dispatch = useDispatch();

    const isLoading = (isFetchingActions && !activeActions) || (isFetchingEvents && !events) || isLoadingPostEvent;
    const currentEvents = events?.[selectedDateKey] ?? [];
    const currentEventActions: EventActionDTO[] = (activeActions ?? [])
        .filter((action) => isActionVisibleOnDate(action, selectedDateKey))
        .map((action) => ({
            actionId: action.id,
            status: currentEvents.find((event) => event.actionId === action.id)?.status || 20,
            prompt: action.prompt,
            priority: action.priority ?? false,
        }));
    const {
        selectedIds, isSaving, isSelectionDisabled, canCompleteOrCancel, canRevert, hasMixedSelection,
        toggleSelection, submitSelection,
    } = useEventSelection(
        selectedDateKey,
        currentEventActions,
        !activeActions || !events || isFetchingActions || isFetchingEvents || isLoadingPostEvent,
    );

    const handleOpenDialog = (type: DialogActionType, eventActionDTO: EventActionDTO) => {
        setDialogType(type);
        setOpenDialog(true);
        setSelectedEventAction({
            actionId: eventActionDTO.actionId,
            status: type === DialogAction.COMPLETE ? 30 : type === DialogAction.CANCEL ? 10 : 20,
            prompt: eventActionDTO.prompt,
            priority: eventActionDTO.priority,
        });
    }

    const onSubmitDialog = async () => {
        if (!selectedEventAction || isLoadingPostEvent) return;

        try {
            await postEvent({
                actionId: selectedEventAction.actionId,
                status: selectedEventAction.status,
                eventDate: selectedDateUTC.toDate(),
            }).unwrap();
            setOpenDialog(false);
            dispatch(showSnackbar({ message: 'Event updated successfully', type: 'success' }));
        } catch {
            dispatch(showSnackbar({ message: 'Failed to update event', type: 'error' }));
        }
    }
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1, gap: 2 }} display='flex' flexDirection='column' alignItems='stretch'>
                <TrackerAppBar title="Daily Tracker Form" />

                <Box sx={{ display: 'flex', gap: 3, height: '100%', alignContent: 'stretch' }} p={4}
                    display="flex"
                    flexDirection={'column'}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            disabled={isSaving}
                            minDate={minSelectableDate}
                            maxDate={maxSelectableDate}
                            format="MMMM dd, yyyy"
                            slotProps={{
                                textField: {
                                    sx: { minWidth: 240 }
                                }
                            }}
                        />
                        <EventSelectionActions
                            selectedIds={selectedIds}
                            disabled={isSelectionDisabled}
                            isSaving={isSaving}
                            canCompleteOrCancel={canCompleteOrCancel}
                            canRevert={canRevert}
                            hasMixedSelection={hasMixedSelection}
                            onSubmit={submitSelection}
                        />
                    </Box>
                    {!isLoading && <Grid container spacing={2} >
                        {currentEventActions.map((eventAction) => (
                            <Grid key={eventAction.actionId}>
                                <ToDoCard
                                    eventActionDTO={eventAction}
                                    onAction={handleOpenDialog}
                                    selected={selectedIds.has(eventAction.actionId)}
                                    onToggleSelection={() => toggleSelection(eventAction.actionId)}
                                    disabled={isSelectionDisabled}
                                />
                            </Grid>
                        ))}
                    </Grid>}
                    {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress />
                    </Box>}
                </Box>
                <DialogWrapper
                    type={dialogType}
                    isopen={openDialog}
                    onSubmit={() => onSubmitDialog()}
                    task={selectedEventAction?.prompt || ''}
                    onClose={() => setOpenDialog(false)}
                />
            </Box>
        </ThemeProvider>
    );
}
