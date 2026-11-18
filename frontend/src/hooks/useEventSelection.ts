import { useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { DialogAction, isSelectableEventStatus } from '../constants/constants';
import { usePostEventsMutation } from '../stores/api/event';
import { showSnackbar } from '../stores/slices/snackbarSlice';
import type { DialogActionType, EventActionDTO } from '../types/types';

const eventUpdates = {
  [DialogAction.COMPLETE]: { status: 30, label: 'Completed' },
  [DialogAction.CANCEL]: { status: 10, label: 'Canceled' },
  [DialogAction.REVERT]: { status: 20, label: 'Reverted' },
};

export const useEventSelection = (
  dateKey: string | null,
  events: Pick<EventActionDTO, 'actionId' | 'status'>[],
  disabled: boolean,
) => {
  const dispatch = useDispatch();
  const [postEvents, { isLoading: isSaving }] = usePostEventsMutation();
  const [selection, setSelection] = useState<{ dateKey: string | null; ids: string[] }>({ dateKey, ids: [] });

  if (selection.dateKey !== dateKey) {
    setSelection({ dateKey, ids: [] });
  }

  const selectedEvents = events.filter(({ actionId, status }) =>
    isSelectableEventStatus(status) && selection.ids.includes(actionId));
  const selectedIds = new Set(selectedEvents.map(({ actionId }) => actionId));
  const canCompleteOrCancel = selectedEvents.length > 0 && selectedEvents.every(({ status }) => status === 20);
  const canRevert = selectedEvents.length > 0 && selectedEvents.every(({ status }) => status !== 20);
  const hasMixedSelection = selectedEvents.length > 0 && !canCompleteOrCancel && !canRevert;
  const isSelectionDisabled = disabled || isSaving || !dateKey;

  const toggleSelection = (actionId: string) => {
    if (isSelectionDisabled) return;

    setSelection((current) => ({
      dateKey,
      ids: current.ids.includes(actionId)
        ? current.ids.filter((id) => id !== actionId)
        : [...current.ids, actionId],
    }));
  };

  const submitSelection = async (action: DialogActionType) => {
    const canSubmit = action === DialogAction.REVERT ? canRevert : canCompleteOrCancel;
    if (isSelectionDisabled || !dateKey || !canSubmit) return;

    const { status, label } = eventUpdates[action];
    const eventDate = moment.utc(dateKey, 'YYYY-MM-DD').toDate();
    const updates = Array.from(selectedIds, (actionId) => ({ actionId, eventDate, status }));

    try {
      const failedIds = await postEvents(updates).unwrap();
      setSelection((current) => current.dateKey === dateKey ? { dateKey, ids: failedIds } : current);
      const updatedCount = updates.length - failedIds.length;

      if (failedIds.length > 0) {
        dispatch(showSnackbar({
          message: `Updated ${updatedCount} of ${updates.length} events. Retry the remaining updates.`,
          type: 'error',
        }));
        return;
      }

      const noun = updatedCount === 1 ? 'event' : 'events';
      dispatch(showSnackbar({ message: `${label} ${updatedCount} ${noun}`, type: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Could not update the selected events. Try again.', type: 'error' }));
    }
  };

  return {
    selectedIds, isSaving, isSelectionDisabled, canCompleteOrCancel, canRevert, hasMixedSelection,
    toggleSelection, submitSelection,
  };
};
