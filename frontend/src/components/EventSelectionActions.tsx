import { useId, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { DialogAction } from '../constants/constants';
import type { DialogActionType } from '../types/types';

interface EventSelectionActionsProps {
  selectedIds: ReadonlySet<string>;
  disabled: boolean;
  isSaving: boolean;
  canCompleteOrCancel: boolean;
  canRevert: boolean;
  hasMixedSelection: boolean;
  onSubmit: (action: DialogActionType) => void;
}

const actionButtons = {
  [DialogAction.COMPLETE]: { label: 'Complete', color: 'success' },
  [DialogAction.CANCEL]: { label: 'Cancel', color: 'error' },
  [DialogAction.REVERT]: { label: 'Revert', color: 'warning' },
} as const;

export const EventSelectionActions = ({
  selectedIds, disabled, isSaving, canCompleteOrCancel, canRevert, hasMixedSelection, onSubmit,
}: EventSelectionActionsProps) => {
  const titleId = useId();
  const [confirmation, setConfirmation] = useState<{
    action: DialogActionType;
    eventIds: ReadonlySet<string>;
  } | null>(null);
  const availableActions: DialogActionType[] = canCompleteOrCancel
    ? [DialogAction.COMPLETE, DialogAction.CANCEL]
    : canRevert ? [DialogAction.REVERT] : [];

  const canConfirm = confirmation !== null
    && availableActions.includes(confirmation.action)
    && confirmation.eventIds.size === selectedIds.size
    && Array.from(confirmation.eventIds).every((id) => selectedIds.has(id));

  const closeConfirmation = () => setConfirmation(null);

  const submitConfirmedAction = () => {
    if (!confirmation || !canConfirm || disabled) return;

    closeConfirmation();
    onSubmit(confirmation.action);
  };

  if (availableActions.length === 0 && !isSaving && !hasMixedSelection && !confirmation) return null;

  return (
    <Stack spacing={1} alignItems="center">
      {availableActions.length > 0 && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="center">
          {availableActions.map((action) => (
            <Button
              key={action}
              variant="contained"
              color={actionButtons[action].color}
              disabled={disabled}
              onClick={() => setConfirmation({ action, eventIds: selectedIds })}
            >
              {actionButtons[action].label}
            </Button>
          ))}
        </Stack>
      )}
      {isSaving && <Typography variant="body2" color="text.secondary" role="status">Saving…</Typography>}
      {hasMixedSelection && (
        <Typography variant="body2" color="text.secondary" textAlign="center" role="status">
          Select only pending events to complete or cancel, or only completed and canceled events to revert.
        </Typography>
      )}
      {confirmation && (
        <Dialog open onClose={closeConfirmation} aria-labelledby={titleId} fullWidth maxWidth="xs">
          <DialogTitle id={titleId}>{actionButtons[confirmation.action].label} the selected events?</DialogTitle>
          {!canConfirm && (
            <DialogContent>
              <Typography role="status">The selection changed. Go back to review the events.</Typography>
            </DialogContent>
          )}
          <DialogActions>
            <Button autoFocus onClick={closeConfirmation}>Go back</Button>
            <Button
              variant="contained"
              color={actionButtons[confirmation.action].color}
              disabled={disabled || !canConfirm}
              onClick={submitConfirmedAction}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
};
