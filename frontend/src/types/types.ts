import type { JSX } from "react";

interface Action {
    id: string;
    name: string;
    goal: string;
    prompt: string;
    type:string;
    active: boolean;
    sequence: number;
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
}

interface EventParameters {
    startDate?: string;
    endDate?: string;
}

interface ToDoProps {
    eventActionDTO: EventActionDTO;
    onAction: (type: DialogActionType, eventActionDTO: EventActionDTO) => void;
}

interface TaskStyle {
  color: 'success' | 'error' | 'warning';
  icon: JSX.Element;
}

interface DialogWrapperProps {
    type: DialogActionType;
    isopen: boolean;
    task: string;
    onSubmit: () => void;
    onClose: () => void;
}

export interface EventActionDTO{
    actionId: string;
    status: number;
    prompt: string;
}

type DialogActionType = 'complete' | 'cancel' | 'revert';
export type { Action, Event, ActionParameters, EventParameters, ToDoProps, DialogActionType, TaskStyle, DialogWrapperProps };