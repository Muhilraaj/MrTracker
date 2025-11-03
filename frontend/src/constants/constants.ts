export const actionStatusColorMap: { [key: number]: string } = {
    10: 'error.main',    // Not Started
    20: 'gray.main',   // In Progress
    30: 'success.main'  // Completed
};




export const DialogAction = {
    COMPLETE: 'complete',
    CANCEL: 'cancel',
    REVERT: 'revert'
} as const;