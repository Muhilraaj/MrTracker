export const actionStatusColorMap: { [key: number]: string } = {
    10: 'error.main',    // Not Started
    20: 'gray.main',   // In Progress
    30: 'success.main'  // Completed
};

export const isSelectableEventStatus = (status: number) => status === 10 || status === 20 || status === 30;

export const priorityActionStyles = {
    borderWidth: 2,
    edgeColor: '#D4AF37',
    bgcolor: '#FFFBF0',
    fontWeight: 600,
} as const;




export const DialogAction = {
    COMPLETE: 'complete',
    CANCEL: 'cancel',
    REVERT: 'revert'
} as const;

export const eventActionAppearance = {
    [DialogAction.COMPLETE]: { label: 'Complete', color: 'success' },
    [DialogAction.CANCEL]: { label: 'Cancel', color: 'error' },
    [DialogAction.REVERT]: { label: 'Revert', color: 'warning' },
} as const;
