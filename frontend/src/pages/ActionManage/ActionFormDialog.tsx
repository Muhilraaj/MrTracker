import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import { useEffect, useState } from 'react';
import type { Action, ActionRequest } from '../../types/types';
import { getActionActiveFromDateKey } from '../../utils/actionDate';

export type ActionFormValues = {
  name: string;
  goal: string;
  prompt: string;
  priority: boolean;
  sequence: string;
  active: boolean;
  activeFromDate: Date | null;
};

const emptyForm = (): ActionFormValues => ({
  name: '',
  goal: '',
  prompt: '',
  priority: false,
  sequence: '',
  active: true,
  activeFromDate: new Date(),
});

const toFormValues = (action?: Action | null): ActionFormValues =>
  action
    ? {
        name: action.name,
        goal: action.goal ?? '',
        prompt: action.prompt,
        priority: action.priority ?? false,
        sequence: String(action.sequence),
        active: action.active ?? true,
        activeFromDate: moment.utc(getActionActiveFromDateKey(action), 'YYYY-MM-DD').toDate(),
      }
    : emptyForm();

interface ActionFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  action?: Action | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ActionRequest) => void;
}

export const ActionFormDialog = ({
  open,
  mode,
  action,
  isSubmitting,
  onClose,
  onSubmit,
}: ActionFormDialogProps) => {
  const [values, setValues] = useState<ActionFormValues>(emptyForm());

  useEffect(() => {
    if (open) {
      setValues(toFormValues(action));
    }
  }, [open, action]);

  const handleChange = (field: keyof Omit<ActionFormValues, 'activeFromDate'>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload: ActionRequest = {
      name: values.name.trim(),
      goal: values.goal.trim(),
      prompt: values.prompt.trim(),
      priority: values.priority,
      active: values.active,
      activeFromDate: values.activeFromDate
        ? moment(values.activeFromDate).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD'),
    };

    if (values.sequence.trim() !== '' || mode === 'edit') {
      payload.sequence = values.sequence.trim() === '' ? 0 : Number(values.sequence);
    }

    onSubmit(payload);
  };

  const isValid = values.name.trim() !== '' && values.prompt.trim() !== '' && values.activeFromDate;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'Add Action' : 'Edit Action'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="Name"
          value={values.name}
          onChange={handleChange('name')}
          required
          fullWidth
        />
        <TextField
          label="Prompt"
          value={values.prompt}
          onChange={handleChange('prompt')}
          required
          fullWidth
          helperText="Shown in daily and monthly trackers"
        />
        <TextField
          label="Goal"
          value={values.goal}
          onChange={handleChange('goal')}
          fullWidth
          multiline
          minRows={2}
        />
        <DatePicker
          label="Active from"
          value={values.activeFromDate}
          onChange={(newValue) => setValues((prev) => ({ ...prev, activeFromDate: newValue }))}
          format="MMMM dd, yyyy"
          slotProps={{
            textField: {
              required: true,
              fullWidth: true,
              helperText: 'Action appears in trackers starting on this date',
            },
          }}
        />
        <TextField
          label="Sequence"
          value={values.sequence}
          onChange={handleChange('sequence')}
          type="number"
          fullWidth
          helperText={mode === 'create' ? 'Leave blank to append at the end' : undefined}
          slotProps={{ htmlInput: { min: 0 } }}
        />
        <FormControlLabel
          control={<Switch checked={values.priority} onChange={handleChange('priority')} />}
          label="Priority"
        />
        {mode === 'edit' && (
          <FormControlLabel
            control={<Switch checked={values.active} onChange={handleChange('active')} />}
            label="Active"
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
