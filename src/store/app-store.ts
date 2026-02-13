import { create } from "zustand";
import { format } from "date-fns";
import { DATE_FORMAT } from "@/lib/constants";

// ── App Store ────────────────────────────────────────────────────────
// Global application state — selected date, toasts, UI flags.

export interface ToastMessage {
    id: string;
    type: "success" | "error" | "info";
    message: string;
}

interface AppState {
    /** Currently selected date for the tracker view (YYYY-MM-DD) */
    selectedDate: string;
    /** Toast notification queue */
    toasts: ToastMessage[];
}

interface AppActions {
    /** Set the selected date */
    setSelectedDate: (date: string) => void;
    /** Show a toast notification */
    addToast: (type: ToastMessage["type"], message: string) => void;
    /** Remove a toast by ID */
    removeToast: (id: string) => void;
}

export const useAppStore = create<AppState & AppActions>()((set) => ({
    selectedDate: format(new Date(), DATE_FORMAT),
    toasts: [],

    setSelectedDate: (date: string) => {
        set({ selectedDate: date });
    },

    addToast: (type, message) => {
        const id = crypto.randomUUID();
        set((state) => ({
            toasts: [...state.toasts, { id, type, message }],
        }));
        // Auto-remove after 5 seconds
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, 5000);
    },

    removeToast: (id: string) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));
