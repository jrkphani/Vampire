/**
 * ValueMax Design Tokens
 * Centralized design system tokens for consistent styling across the application
 * This file exports both CSS custom properties and TypeScript constants
 */

// ===== SHADCN/UI COMPATIBLE TOKENS =====

export const shadcnTokens = {
  colors: {
    // Primary Color: ValueMax Brand Red
    primary: 'hsl(338 76% 32%)', // #8B1538
    primaryForeground: 'hsl(0 0% 98%)', // White text on red

    // Secondary Color: Professional Slate
    secondary: 'hsl(215 20% 65%)', // #94A3B8
    secondaryForeground: 'hsl(215 25% 27%)', // #1E293B

    // Accent Color: ValueMax Brand Gold
    accent: 'hsl(45 93% 47%)', // #F59E0B
    accentForeground: 'hsl(222 84% 5%)', // Dark text on gold

    // Background Colors
    background: 'hsl(0 0% 100%)', // #FFFFFF
    foreground: 'hsl(222 84% 5%)', // #0F172A

    // Card & Surface Colors
    card: 'hsl(210 40% 98%)', // #F8FAFC
    cardForeground: 'hsl(222 84% 5%)', // #0F172A

    // Popover Colors
    popover: 'hsl(0 0% 100%)', // #FFFFFF
    popoverForeground: 'hsl(222 84% 5%)', // #0F172A

    // Border Colors
    border: 'hsl(214 32% 91%)', // #E2E8F0
    input: 'hsl(214 32% 91%)', // #E2E8F0

    // Muted Colors
    muted: 'hsl(210 40% 96%)', // #F1F5F9
    mutedForeground: 'hsl(215 16% 47%)', // #64748B

    // State Colors
    destructive: 'hsl(0 84% 60%)', // #EF4444
    destructiveForeground: 'hsl(0 0% 98%)', // White
    success: 'hsl(45 93% 47%)', // #F59E0B (brand gold)
    successForeground: 'hsl(222 84% 5%)', // Dark text
    warning: 'hsl(25 95% 53%)', // #F97316
    warningForeground: 'hsl(0 0% 98%)', // White
    info: 'hsl(221 83% 53%)', // #3B82F6
    infoForeground: 'hsl(0 0% 98%)', // White

    // Focus Ring
    ring: 'hsl(338 76% 32%)', // #8B1538 (brand red)
  },

  radius: {
    default: '0.5rem', // 8px
    sm: 'calc(0.5rem - 2px)', // 6px
    md: 'calc(0.5rem - 4px)', // 4px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
  },
} as const;

// ===== LEGACY VALUEMAX TOKENS =====

export const designTokens = {
  colors: {
    primary: {
      main: '#1E293B',
      dark: '#0F172A',
      light: '#334155',
    },
    brand: {
      red: '#8B1538',
      redDark: '#6B1028',
      gold: '#F59E0B',
      goldLight: '#FCD34D',
    },
    semantic: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      muted: '#94A3B8',
    },
    background: {
      default: '#FFFFFF',
      surface: '#F8FAFC',
    },
    border: {
      default: '#E2E8F0',
      light: '#F1F5F9',
    },
  },
  spacing: {
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
  },
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        'SF Pro Display',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'system-ui',
        'sans-serif',
      ],
      mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.25rem', // 20px
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    focus: '0 0 0 3px rgba(139, 21, 56, 0.1)',
  },
  animation: {
    duration: {
      instant: '100ms',
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const;

// ===== TYPE DEFINITIONS =====

export type ShadcnColors = typeof shadcnTokens.colors;
export type DesignTokens = typeof designTokens;
export type ColorPalette = typeof designTokens.colors;
export type Spacing = typeof designTokens.spacing;
export type Typography = typeof designTokens.typography;
export type BorderRadius = typeof designTokens.borderRadius;
export type Shadow = typeof designTokens.shadow;
export type Animation = typeof designTokens.animation;

// ===== UTILITY FUNCTIONS =====

/**
 * Get a color value from the design tokens
 * @param path - Dot notation path to the color (e.g., 'brand.red', 'text.primary')
 * @returns The color value as a string
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let current: any = designTokens.colors;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Color token not found: ${path}`);
      return designTokens.colors.text.primary; // fallback
    }
  }

  return typeof current === 'string'
    ? current
    : designTokens.colors.text.primary;
}

/**
 * Get a spacing value from the design tokens
 * @param size - The spacing size key (e.g., '1', '4', '8')
 * @returns The spacing value as a string
 */
export function getSpacing(size: keyof typeof designTokens.spacing): string {
  return designTokens.spacing[size] || designTokens.spacing[4];
}

/**
 * Get a border radius value from the design tokens
 * @param size - The radius size key (e.g., 'sm', 'md', 'lg')
 * @returns The border radius value as a string
 */
export function getBorderRadius(
  size: keyof typeof designTokens.borderRadius
): string {
  return designTokens.borderRadius[size] || designTokens.borderRadius.md;
}

/**
 * Create a CSS custom property reference
 * @param property - The CSS custom property name (without --)
 * @returns CSS var() function string
 */
export function cssVar(property: string): string {
  return `var(--${property})`;
}

/**
 * Create an HSL color string compatible with Tailwind CSS
 * @param hue - Hue value (0-360)
 * @param saturation - Saturation percentage (0-100)
 * @param lightness - Lightness percentage (0-100)
 * @returns HSL color string
 */
export function hsl(
  hue: number,
  saturation: number,
  lightness: number
): string {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

// ===== COMPONENT THEME PRESETS =====

export const componentThemes = {
  button: {
    financial: {
      background: designTokens.colors.brand.red,
      foreground: '#FFFFFF',
      hover: designTokens.colors.brand.redDark,
      ring: designTokens.colors.brand.red,
    },
    success: {
      background: designTokens.colors.brand.gold,
      foreground: designTokens.colors.text.primary,
      hover: designTokens.colors.brand.goldLight,
      ring: designTokens.colors.brand.gold,
    },
    professional: {
      background: designTokens.colors.primary.main,
      foreground: '#FFFFFF',
      hover: designTokens.colors.primary.light,
      ring: designTokens.colors.primary.main,
    },
  },
  badge: {
    active: {
      background: designTokens.colors.semantic.success,
      foreground: '#FFFFFF',
    },
    pending: {
      background: designTokens.colors.semantic.warning,
      foreground: '#FFFFFF',
    },
    error: {
      background: designTokens.colors.semantic.error,
      foreground: '#FFFFFF',
    },
    neutral: {
      background: designTokens.colors.text.secondary,
      foreground: '#FFFFFF',
    },
  },
} as const;

export type ComponentThemes = typeof componentThemes;

// ===== CSS CUSTOM PROPERTIES MAP =====

/**
 * Map of CSS custom properties to their values
 * Use this for dynamic CSS generation or runtime theme switching
 */
export const cssCustomProperties = {
  // shadcn/ui CSS variables
  '--primary': '338 76% 32%',
  '--primary-foreground': '0 0% 98%',
  '--secondary': '215 20% 65%',
  '--secondary-foreground': '215 25% 27%',
  '--accent': '45 93% 47%',
  '--accent-foreground': '222 84% 5%',
  '--background': '0 0% 100%',
  '--foreground': '222 84% 5%',
  '--card': '210 40% 98%',
  '--card-foreground': '222 84% 5%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '222 84% 5%',
  '--border': '214 32% 91%',
  '--input': '214 32% 91%',
  '--muted': '210 40% 96%',
  '--muted-foreground': '215 16% 47%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--ring': '338 76% 32%',
  '--radius': '0.5rem',

  // Legacy ValueMax design tokens
  '--color-primary-main': designTokens.colors.primary.main,
  '--color-primary-dark': designTokens.colors.primary.dark,
  '--color-primary-light': designTokens.colors.primary.light,
  '--color-brand-red': designTokens.colors.brand.red,
  '--color-brand-gold': designTokens.colors.brand.gold,
  '--color-brand-red-dark': designTokens.colors.brand.redDark,
  '--color-brand-gold-light': designTokens.colors.brand.goldLight,
  '--color-success': designTokens.colors.semantic.success,
  '--color-error': designTokens.colors.semantic.error,
  '--color-warning': designTokens.colors.semantic.warning,
  '--color-info': designTokens.colors.semantic.info,
  '--color-text-primary': designTokens.colors.text.primary,
  '--color-text-secondary': designTokens.colors.text.secondary,
  '--color-text-muted': designTokens.colors.text.muted,
  '--color-background': designTokens.colors.background.default,
  '--color-surface': designTokens.colors.background.surface,
  '--color-border': designTokens.colors.border.default,
  '--color-border-light': designTokens.colors.border.light,

  // Box Shadows
  '--shadow-sm': designTokens.shadow.sm,
  '--shadow-md': designTokens.shadow.md,
  '--shadow-lg': designTokens.shadow.lg,
  '--shadow-xl': designTokens.shadow.xl,
  '--shadow-focus': designTokens.shadow.focus,
} as const;

export type CSSCustomProperties = typeof cssCustomProperties;

// Default export
export default designTokens;
