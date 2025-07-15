import * as React from 'react';
import { v4 as uuid } from 'uuid';

import { ToastProps } from './toast';

const TOAST_LIMIT = 1;
// const TOAST_REMOVE_DELAY = 1000000 // Unused for now

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

type ActionType = typeof actionTypes;

type Action =
  | { type: ActionType['ADD_TOAST']; toast: ToasterToast }
  | { type: ActionType['UPDATE_TOAST']; toast: Partial<ToasterToast> }
  | { type: ActionType['DISMISS_TOAST']; toastId?: ToasterToast['id'] }
  | { type: ActionType['REMOVE_TOAST']; toastId?: ToasterToast['id'] };

interface State {
  toasts: ToasterToast[];
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action;

      // ! Side effects ! - This means all toasts will be dismissed
      // Make sure you understand the implications of this
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      };
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

function generateId() {
  return uuid();
}

// type Toast = Pick<ToasterToast, "id" | "duration" | "open" | "onOpenChange"> // Unused for now

// type Dispatch = (action: Action) => void // Unused for now

const listeners: ((state: State) => void)[] = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => listener(memoryState));
}

type ToastOptions = Partial<ToasterToast>;

type ToastFn = (props: ToastOptions) => { id: string };

type UseToastReturn = {
  toasts: ToasterToast[];
  toast: ToastFn;
  dismiss: (toastId?: string) => void;
};

export function useToast(): UseToastReturn {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    toasts: state.toasts,
    toast: React.useCallback((props: ToastOptions) => {
      const id = generateId();

      const dismiss = () =>
        dispatch({
          type: actionTypes.DISMISS_TOAST,
          toastId: id,
        });

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          id,
          open: true,
          onOpenChange: dismiss,
          ...props,
        },
      });

      return { id };
    }, []),
    dismiss: React.useCallback((toastId?: string) => {
      const action = {
        type: actionTypes.DISMISS_TOAST,
        ...(toastId && { toastId }),
      } as const;
      dispatch(action);
    }, []),
  };
}
