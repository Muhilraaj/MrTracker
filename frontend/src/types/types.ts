interface Action {
    id: string;
    name: string;
    goal: string;
    prompt: string;
    type:string;
    active: boolean;
    sequence: number;
    priority: boolean;
    createdDate: string | null;
    activeFromDate: string | null;
}

interface Event {
    id: string | null;
    actionId: string;
    status:number;
    eventDate: Date | null;
    updatedDate: Date | null;
}

interface ActionParameters {
    active?: boolean;
    asOfDate?: string;
}

interface ActionRequest {
    name: string;
    goal?: string;
    prompt: string;
    priority?: boolean;
    sequence?: number;
    active?: boolean;
    activeFromDate?: string;
}

interface EventParameters {
    startDate?: string;
    endDate?: string;
}

interface ToDoProps {
    eventActionDTO: EventActionDTO;
    onAction: (type: DialogActionType, eventActionDTO: EventActionDTO) => void;
    selected: boolean;
    onToggleSelection: () => void;
    disabled: boolean;
}

export interface EventActionDTO{
    actionId: string;
    status: number;
    prompt: string;
    priority: boolean;
}

export type AuthBody = {
    username: string;
    password: string;
};

export type AuthResponse = {
    message: string;
    expiryMinutes: number;
};

type DialogActionType = 'complete' | 'cancel' | 'revert';
export type { Action, Event, ActionParameters, ActionRequest, EventParameters, ToDoProps, DialogActionType };
