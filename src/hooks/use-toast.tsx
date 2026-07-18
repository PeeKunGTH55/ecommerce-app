"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "loading";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "DISMISS"; id: string }
  | { type: "CLEAR" };

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "DISMISS":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "CLEAR":
      return { ...state, toasts: [] };
    default:
      return state;
  }
}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const toast = useCallback((options: Omit<Toast, "id">) => {
    const id = generateId();
    dispatch({ type: "ADD", toast: { ...options, id } });

    if (options.duration !== Infinity && options.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: "DISMISS", id });
      }, options.duration ?? 5000);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: "DISMISS", id });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss, clear }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}