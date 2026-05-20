import { ThemeProvider } from "@emotion/react";
import { useGetActionsQuery } from "../../stores/api/action";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import theme from '../../assets/theme';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ToDoCard } from "../../components/ToDoCard";
import DialogWrapper from "../../components/DialogWrapper";
import { useEffect, useState } from "react";
import type { DialogActionType } from "../../types/types";
import { DialogAction } from "../../constants/constants";
import { useGetEventsQuery, usePostEventMutation } from "../../stores/api/event";
import moment from "moment";
import type { EventActionDTO } from "../../types/types";
import { Grid } from "@mui/material";
import { showSnackbar } from "../../stores/slices/snackbarSlice";
import { useDispatch } from "react-redux";
import CircularProgress from '@mui/material/CircularProgress';

export const DailyTrackerForm = () => {
    const dateUTC = moment.utc();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const selectedDateUTC = moment.utc(selectedDate ?? new Date());
    const selectedDateKey = selectedDateUTC.format('YYYY-MM-DD');
    const minSelectableDate = dateUTC.clone().subtract(6, "days").toDate();
    const maxSelectableDate = dateUTC.clone().toDate();
    const { data: activeAction, isLoading: isLoadingActiveAction } = useGetActionsQuery({ active: true });
    const { data: events, isLoading: isLoadingTodayEvents } = useGetEventsQuery({
        startDate: selectedDateUTC.clone().startOf('day').toISOString(),
        endDate: selectedDateUTC.clone().endOf('day').toISOString()
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<DialogActionType>(DialogAction.COMPLETE);
    const [currentEventActions, setCurrentEventActions] = useState<EventActionDTO[]>([]);
    const [selectedEventAction, setSelectedEventAction] = useState<EventActionDTO | null>(null);
    const [postEvent,{ isLoading: isLoadingPostEvent }] = usePostEventMutation();
    const dispatch = useDispatch();

    const isLoading = isLoadingActiveAction || isLoadingTodayEvents || isLoadingPostEvent;

    useEffect(() => {
        let currentEvents = events ? events[selectedDateKey] || [] : [];
        const eventActions: EventActionDTO[] = [];
        activeAction?.forEach((action) => {
            const matchedEvent = currentEvents.find((event) => event.actionId === action.id);
            eventActions.push({ actionId: action.id, status: matchedEvent?.status || 20, prompt: action.prompt });
        });
        setCurrentEventActions(eventActions);
    }, [events, activeAction, selectedDateKey]);

    const handleOpenDialog = (type: DialogActionType, eventActionDTO: EventActionDTO) => {
        setDialogType(type);
        setOpenDialog(true);
        setSelectedEventAction({ actionId: eventActionDTO.actionId, status: type === DialogAction.COMPLETE ? 30 : type === DialogAction.CANCEL ? 10 : 20, prompt: eventActionDTO.prompt });
    }

    const onSubmitDialog = () => {
        // Handle dialog submission logic here
        try {
            postEvent({
                actionId: selectedEventAction?.actionId || '',
                status: selectedEventAction?.status || 10,
                eventDate: selectedDate
            }).unwrap();
            setOpenDialog(false);
            dispatch(showSnackbar({ message: 'Event updated successfully', type: 'success' }));
        } catch (error) {
            dispatch(showSnackbar({ message: 'Failed to update event', type: 'error' }));
        }
    }
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1, gap: 2 }} display='flex' flexDirection='column' alignItems='stretch'>
                <AppBar position="static" sx={{ width: '100%' }}>
                    <Toolbar variant="dense">
                        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit" component="div">
                            Daily Tracker Form
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box sx={{ display: 'flex', gap: 3, height: '100%', alignContent: 'stretch' }} p={4}
                    display="flex"
                    border='solid'
                    flexDirection={'column'}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            minDate={minSelectableDate}
                            maxDate={maxSelectableDate}
                            format="MMMM dd, yyyy"
                            slotProps={{
                                textField: {
                                    sx: { minWidth: 240 }
                                }
                            }}
                        />
                    </Box>
                    {!isLoading && <Grid container spacing={2} >
                        {currentEventActions.map((eventAction) => (
                            <Grid >
                                <ToDoCard
                                    eventActionDTO={eventAction}
                                    onAction={handleOpenDialog}
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