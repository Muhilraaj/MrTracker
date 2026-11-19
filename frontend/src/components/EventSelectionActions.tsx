import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { DialogAction, eventActionAppearance } from '../constants/constants';
import type { DialogActionType } from '../types/types';
import DialogWrapper from './DialogWrapper';

interface EventSelectionActionsProps {
  selectedIds: ReadonlySet<string>;
  disabled: boolean;
  isSaving: boolean;
  canCompleteOrCancel: boolean;
  canRevert: boolean;
  hasMixedSelection: boolean;
  onSubmit: (action: DialogActionType) => void;
}

export const EventSelectionActions = ({
  selectedIds, disabled, isSaving, canCompleteOrCancel, canRevert, hasMixedSelection, onSubmit,
}: EventSelectionActionsProps) => {
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
              color={eventActionAppearance[action].color}
              disabled={disabled}
              onClick={() => setConfirmation({ action, eventIds: selectedIds })}
            >
              {eventActionAppearance[action].label}
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
        <DialogWrapper
          action={confirmation.action}
          open
          subject="the selected events"
          confirmDisabled={disabled || !canConfirm}
          onClose={closeConfirmation}
          onSubmit={submitConfirmedAction}
        >
          {!canConfirm && (
            <Typography role="status">The selection changed. Go back to review the events.</Typography>
          )}
        </DialogWrapper>
      )}
    </Stack>
  );
};
