/**
 * @fileoverview UIStore - Global UI state management for the ValueMax Vampire application
 * 
 * This store manages all global UI state including:
 * - Navigation state (sidebar, breadcrumbs, current page)
 * - Modal and overlay management (command palette, dialogs)
 * - Toast notification system with auto-dismissal
 * - Global loading states for async operations
 * - Error state management with contextual error handling
 * - User preferences (theme, font size, keyboard shortcuts)
 * - Search and filter state management
 * - Performance monitoring metrics
 * 
 * The store provides a centralized way to manage UI state across the entire
 * application, ensuring consistent behavior and eliminating prop drilling.
 * 
 * @author ValueMax Development Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Toast, LoadingStates, ErrorStates } from '@/types/ui';

interface UIState {
  // Navigation
  sidebarOpen: boolean;
  currentPage: string;
  breadcrumbs: Array<{ label: string; href?: string }>;

  // Modals and overlays
  activeModal: string | null;
  commandPaletteOpen: boolean;

  // Notifications
  toasts: Toast[];

  // Global loading states
  loadingStates: LoadingStates;

  // Global error states
  errorStates: ErrorStates;

  // Theme and preferences
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  keyboardShortcutsEnabled: boolean;

  // Search and filters
  globalSearchQuery: string;
  activeFilters: Record<string, unknown>;

  // Performance monitoring
  pageLoadTime: number | null;
  lastApiCallTime: number | null;

  // Actions - Navigation
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void;

  // Actions - Modals
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;

  // Actions - Notifications
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;

  // Actions - Loading States
  setLoading: (key: string, loading: boolean, message?: string) => void;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;

  // Actions - Error States
  setError: (key: string, error: Error | string, errorCode?: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;

  // Actions - Theme and Preferences
  setTheme: (theme: UIState['theme']) => void;
  setFontSize: (size: UIState['fontSize']) => void;
  toggleKeyboardShortcuts: () => void;

  // Actions - Search
  setGlobalSearchQuery: (query: string) => void;
  setActiveFilters: (filters: Record<string, unknown>) => void;
  clearFilters: () => void;

  // Actions - Performance
  setPageLoadTime: (time: number) => void;
  setLastApiCallTime: (time: number) => void;

  // Getters
  isLoading: (key?: string) => boolean;
  hasError: (key?: string) => boolean;
  getToastCount: () => number;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      currentPage: 'dashboard',
      breadcrumbs: [],
      activeModal: null,
      commandPaletteOpen: false,
      toasts: [],
      loadingStates: {},
      errorStates: {},
      theme: 'light',
      fontSize: 'medium',
      keyboardShortcutsEnabled: true,
      globalSearchQuery: '',
      activeFilters: {},
      pageLoadTime: null,
      lastApiCallTime: null,

      // Navigation Actions
      setSidebarOpen: open => {
        set({ sidebarOpen: open });
      },

      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setCurrentPage: page => {
        set({ currentPage: page });
      },

      setBreadcrumbs: breadcrumbs => {
        set({ breadcrumbs });
      },

      // Modal Actions
      openModal: modalId => {
        set({ activeModal: modalId });
      },

      closeModal: () => {
        set({ activeModal: null });
      },

      setCommandPaletteOpen: open => {
        set({ commandPaletteOpen: open });
      },

      toggleCommandPalette: () => {
        set(state => ({ commandPaletteOpen: !state.commandPaletteOpen }));
      },

      // Toast Actions
      addToast: toastData => {
        const toast: Toast = {
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          duration: 5000, // Default 5 seconds
          persistent: false,
          ...toastData,
        };

        set(state => ({
          toasts: [...state.toasts, toast],
        }));

        // Auto-remove non-persistent toasts
        if (!toast.persistent && toast.duration) {
          setTimeout(() => {
            get().removeToast(toast.id);
          }, toast.duration);
        }
      },

      removeToast: id => {
        set(state => ({
          toasts: state.toasts.filter(toast => toast.id !== id),
        }));
      },

      clearAllToasts: () => {
        set({ toasts: [] });
      },

      // Loading State Actions
      setLoading: (key, loading, message) => {
        set(state => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: { isLoading: loading, message },
          },
        }));
      },

      clearLoading: key => {
        set(state => {
          const { [key]: _, ...rest } = state.loadingStates;
          return { loadingStates: rest };
        });
      },

      clearAllLoading: () => {
        set({ loadingStates: {} });
      },

      // Error State Actions
      setError: (key, error, errorCode) => {
        set(state => ({
          errorStates: {
            ...state.errorStates,
            [key]: {
              hasError: true,
              error: typeof error === 'string' ? error : error.message,
              errorCode,
            },
          },
        }));
      },

      clearError: key => {
        set(state => {
          const { [key]: _, ...rest } = state.errorStates;
          return { errorStates: rest };
        });
      },

      clearAllErrors: () => {
        set({ errorStates: {} });
      },

      // Theme and Preferences Actions
      setTheme: theme => {
        set({ theme });
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setFontSize: fontSize => {
        set({ fontSize });
        // Apply font size to document
        document.documentElement.setAttribute('data-font-size', fontSize);
      },

      toggleKeyboardShortcuts: () => {
        set(state => ({
          keyboardShortcutsEnabled: !state.keyboardShortcutsEnabled,
        }));
      },

      // Search Actions
      setGlobalSearchQuery: query => {
        set({ globalSearchQuery: query });
      },

      setActiveFilters: filters => {
        set({ activeFilters: filters });
      },

      clearFilters: () => {
        set({ activeFilters: {} });
      },

      // Performance Actions
      setPageLoadTime: time => {
        set({ pageLoadTime: time });
      },

      setLastApiCallTime: time => {
        set({ lastApiCallTime: time });
      },

      // Getters
      isLoading: key => {
        const { loadingStates } = get();
        if (key) {
          return loadingStates[key]?.isLoading ?? false;
        }
        return Object.values(loadingStates).some(state => state.isLoading);
      },

      hasError: key => {
        const { errorStates } = get();
        if (key) {
          return errorStates[key]?.hasError ?? false;
        }
        return Object.values(errorStates).some(state => state.hasError);
      },

      getToastCount: () => {
        return get().toasts.length;
      },
    }),
    {
      name: 'ui-store',
    }
  )
);
