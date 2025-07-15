// Import the actual LucideIcon type for compatibility
import type { LucideIcon } from 'lucide-react';

// Icon Component Type - Use the actual LucideIcon type plus allow simple className-only components
export type IconComponent =
  | LucideIcon
  | React.ComponentType<{ className?: string }>;

// More specific type for components that only need className
export type SimpleIconComponent = React.ComponentType<{ className?: string }>;

// Common UI Component Props
export interface BaseComponentProps {
  className?: string | undefined;
  children?: React.ReactNode | undefined;
}

// Layout Types
export interface LayoutProps extends BaseComponentProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  actions?: React.ReactNode | undefined;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: IconComponent | undefined;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  badge?: string | number | undefined;
}

export interface BreadcrumbItem {
  label: string;
  href?: string | undefined;
  active?: boolean | undefined;
}

// Form Types
export interface FormFieldProps {
  name: string;
  label?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  helper?: string | undefined;
  disabled?: boolean | undefined;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

// Table Types
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableAction<T = unknown> {
  label: string;
  icon?: IconComponent | undefined;
  onClick: (item: T) => void;
  disabled?: ((item: T) => boolean) | undefined;
  variant?: 'primary' | 'secondary' | 'danger' | undefined;
}

// Modal Types
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string | undefined;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | undefined;
  closeOnBackdrop?: boolean | undefined;
  closeOnEscape?: boolean | undefined;
}

// Toast/Notification Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string | undefined;
  duration?: number | undefined;
  persistent?: boolean | undefined;
  action?:
    | {
        label: string;
        onClick: () => void;
      }
    | undefined;
}

// Theme Types
export interface ThemeColors {
  primary: {
    main: string;
    dark: string;
    light: string;
  };
  brand: {
    red: string;
    redDark: string;
    gold: string;
    goldLight: string;
  };
  semantic: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  background: {
    default: string;
    surface: string;
  };
  border: {
    default: string;
    light: string;
  };
}

export interface ThemeSpacing {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  message?: string | undefined;
}

export interface LoadingStates {
  [key: string]: LoadingState;
}

// Error States
export interface ErrorState {
  hasError: boolean;
  error?: Error | string | undefined;
  errorCode?: string | undefined;
}

export interface ErrorStates {
  [key: string]: ErrorState;
}

// Search/Filter Types
export interface SearchState {
  query: string;
  filters: Record<string, unknown>;
  results: unknown[];
  isSearching: boolean;
  hasMore: boolean;
}

// Pagination Types
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Command Palette Types
export interface Command {
  id: string;
  label: string;
  description?: string | undefined;
  icon?: IconComponent | undefined;
  shortcut?: string[] | undefined;
  group?: string | undefined;
  action: () => void;
  disabled?: boolean | undefined;
}

export interface CommandGroup {
  id: string;
  label: string;
  commands: Command[];
}

// Status Badge Types
export type StatusVariant =
  | 'active'
  | 'completed'
  | 'pending'
  | 'error'
  | 'redeemed'
  | 'expired';

// Form Validation Types
export interface FieldError {
  message: string;
  type: string;
}

export interface FormErrors {
  [fieldName: string]: FieldError;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// Component State Types
export interface ComponentState {
  mounted: boolean;
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  error?: string | undefined;
}

// Keyboard Navigation Types
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean | undefined;
  alt?: boolean | undefined;
  shift?: boolean | undefined;
  action: () => void;
  description: string;
  disabled?: boolean | undefined;
}

// Accessibility Types
export interface A11yProps {
  'aria-label'?: string | undefined;
  'aria-labelledby'?: string | undefined;
  'aria-describedby'?: string | undefined;
  'aria-expanded'?: boolean | undefined;
  'aria-hidden'?: boolean | undefined;
  role?: string | undefined;
  tabIndex?: number | undefined;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  delay?: number | undefined;
  easing: string;
  repeat?: boolean | undefined;
}

// Responsive Types
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ResponsiveValue<T> {
  xs?: T | undefined;
  sm?: T | undefined;
  md?: T | undefined;
  lg?: T | undefined;
  xl?: T | undefined;
  '2xl'?: T | undefined;
}

// Data Visualization Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[] | undefined;
    borderColor?: string | string[] | undefined;
  }>;
}

// File Upload Types
export interface FileUploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  errors: string[];
}

// Virtual Scroll Types
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number | undefined;
}

// Drag and Drop Types
export interface DragItem {
  id: string;
  type: string;
  data: unknown;
}

export interface DropResult {
  dragItem: DragItem;
  dropTarget: string;
  position?: 'before' | 'after' | 'inside' | undefined;
}

// Print Types
export interface PrintConfig {
  orientation: 'portrait' | 'landscape';
  paperSize: 'A4' | 'A5' | 'letter' | 'thermal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Utility Types for UI State Management
export type UIState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncUIState<T = unknown> {
  state: UIState;
  data?: T | undefined;
  error?: string | undefined;
  lastUpdated?: string | undefined;
}
