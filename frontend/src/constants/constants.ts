export const actionStatusColorMap: { [key: number]: string } = {
    10: 'error.main',    // Not Started
    20: 'gray.main',   // In Progress
    30: 'success.main'  // Completed
};

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