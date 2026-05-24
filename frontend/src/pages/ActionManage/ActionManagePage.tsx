import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ThemeProvider } from '@emotion/react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import theme from '../../assets/theme';
import { TrackerAppBar } from '../../components/TrackerAppBar';
import { priorityActionStyles } from '../../constants/constants';
import {
  useCreateActionMutation,
  useGetActionsQuery,
  useUpdateActionMutation,
} from '../../stores/api/action';
import { showSnackbar } from '../../stores/slices/snackbarSlice';
import type { Action, ActionRequest } from '../../types/types';
import { formatActiveFromDateForRequest, getActionActiveFromDateKey } from '../../utils/actionDate';
import { ActionFormDialog } from './ActionFormDialog';

export const ActionManagePage = () => {
  const dispatch = useDispatch();
  const { data: actions, isLoading } = useGetActionsQuery();
  const [createAction, { isLoading: isCreating }] = useCreateActionMutation();
  const [updateAction, { isLoading: isUpdating }] = useUpdateActionMutation();

  const [showInactive, setShowInactive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuAction, setMenuAction] = useState<Action | null>(null);

  const visibleActions = useMemo(() => {
    if (!actions) return [];
    const filtered = showInactive ? actions : actions.filter((action) => action.active);
    return [...filtered].sort((a, b) => {
      const priorityDiff = Number(b.priority ?? false) - Number(a.priority ?? false);
      if (priorityDiff !== 0) return priorityDiff;
      return a.sequence - b.sequence;
    });
  }, [actions, showInactive]);

  const isBusy = isLoading || isCreating || isUpdating;

  const openCreateDialog = () => {
    setDialogMode('create');
    setSelectedAction(null);
    setDialogOpen(true);
  };

  const openEditDialog = (action: Action) => {
    setDialogMode('edit');
    setSelectedAction(action);
    setDialogOpen(true);
    closeMenu();
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuAction(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, action: Action) => {
    setMenuAnchor(event.currentTarget);
    setMenuAction(action);
  };

  const handleSubmit = async (values: ActionRequest) => {
    try {
      if (dialogMode === 'create') {
        await createAction(values).unwrap();
        dispatch(showSnackbar({ message: 'Action created successfully', type: 'success' }));
      } else if (selectedAction) {
        await updateAction({ id: selectedAction.id, body: values }).unwrap();
        dispatch(showSnackbar({ message: 'Action updated successfully', type: 'success' }));
      }
      setDialogOpen(false);
    } catch {
      dispatch(showSnackbar({ message: 'Failed to save action', type: 'error' }));
    }
  };

  const setActiveStatus = async (action: Action, active: boolean) => {
    closeMenu();
    try {
      await updateAction({
        id: action.id,
        body: {
          name: action.name,
          goal: action.goal,
          prompt: action.prompt,
          priority: action.priority ?? false,
          sequence: action.sequence,
          active,
          activeFromDate: formatActiveFromDateForRequest(action),
        },
      }).unwrap();
      dispatch(
        showSnackbar({
          message: active ? 'Action reactivated' : 'Action deactivated',
          type: 'success',
        })
      );
    } catch {
      dispatch(showSnackbar({ message: 'Failed to update action status', type: 'error' }));
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, gap: 2 }} display="flex" flexDirection="column" alignItems="stretch">
        <TrackerAppBar title="Manage Actions" />

        <Box sx={{ px: 4, pb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(event) => setShowInactive(event.target.checked)}
                />
              }
              label="Show inactive"
            />
            <Button variant="contained" onClick={openCreateDialog}>
              Add Action
            </Button>
          </Box>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Prompt</TableCell>
                    <TableCell>Active from</TableCell>
                    <TableCell align="center">Sequence</TableCell>
                    <TableCell align="center">Priority</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleActions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography color="text.secondary" align="center" py={2}>
                          No actions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {visibleActions.map((action) => (
                    <TableRow
                      key={action.id}
                      hover
                      sx={{
                        ...(action.priority && {
                          boxShadow: `inset 0 0 0 ${priorityActionStyles.borderWidth}px ${priorityActionStyles.edgeColor}`,
                          bgcolor: priorityActionStyles.bgcolor,
                        }),
                        ...(!action.active && { opacity: 0.72 }),
                      }}
                    >
                      <TableCell>{action.name}</TableCell>
                      <TableCell>{action.prompt}</TableCell>
                      <TableCell>
                        {moment.utc(getActionActiveFromDateKey(action), 'YYYY-MM-DD').format('MMM D, YYYY')}
                      </TableCell>
                      <TableCell align="center">{action.sequence}</TableCell>
                      <TableCell align="center">
                        {action.priority ? (
                          <Chip label="Yes" size="small" sx={{ borderColor: priorityActionStyles.edgeColor }} variant="outlined" />
                        ) : (
                          <Chip label="No" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={action.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={action.active ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton aria-label="action menu" onClick={(event) => handleMenuOpen(event, action)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
          <MenuItem onClick={() => menuAction && openEditDialog(menuAction)}>Edit</MenuItem>
          {menuAction?.active ? (
            <MenuItem onClick={() => menuAction && setActiveStatus(menuAction, false)}>
              Deactivate
            </MenuItem>
          ) : (
            <MenuItem onClick={() => menuAction && setActiveStatus(menuAction, true)}>
              Reactivate
            </MenuItem>
          )}
        </Menu>

        <ActionFormDialog
          open={dialogOpen}
          mode={dialogMode}
          action={selectedAction}
          isSubmitting={isBusy}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      </Box>
    </ThemeProvider>
  );
};
