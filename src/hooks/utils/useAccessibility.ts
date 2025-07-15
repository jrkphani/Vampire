import { useEffect, useState, useRef, useCallback } from 'react';

interface AccessibilityOptions {
  announceChanges?: boolean;
  focusManagement?: boolean;
  keyboardTraps?: boolean;
  reducedMotion?: boolean;
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const {
    announceChanges = true,
    focusManagement = true,
    keyboardTraps = true,
    reducedMotion = true,
  } = options;

  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const announcerRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Detect reduced motion preference
  useEffect(() => {
    if (!reducedMotion) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [reducedMotion]);

  // Detect high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = () => {
      setIsKeyboardUser(true);
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Create announcer element
  useEffect(() => {
    if (!announceChanges) return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'accessibility-announcer';

    document.body.appendChild(announcer);
    announcerRef.current = announcer;

    return () => {
      if (announcer.parentNode) {
        announcer.parentNode.removeChild(announcer);
      }
    };
  }, [announceChanges]);

  // Announce messages to screen readers
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announceChanges || !announcerRef.current) return;

      // Clear previous announcement
      announcerRef.current.textContent = '';
      announcerRef.current.setAttribute('aria-live', priority);

      // Add new announcement with small delay to ensure it's announced
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 100);
    },
    [announceChanges]
  );

  // Focus management utilities
  const saveFocus = useCallback(() => {
    if (!focusManagement) return;
    lastFocusedElement.current = document.activeElement as HTMLElement;
  }, [focusManagement]);

  const restoreFocus = useCallback(() => {
    if (!focusManagement || !lastFocusedElement.current) return;

    try {
      lastFocusedElement.current.focus();
    } catch (error) {
      // Element might not be focusable anymore
      console.warn('Could not restore focus to element:', error);
    }
  }, [focusManagement]);

  const focusFirst = useCallback(
    (container: HTMLElement | null) => {
      if (!focusManagement || !container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    },
    [focusManagement]
  );

  const focusLast = useCallback(
    (container: HTMLElement | null) => {
      if (!focusManagement || !container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;
      if (lastElement) {
        lastElement.focus();
      }
    },
    [focusManagement]
  );

  // Keyboard trap utility
  const trapFocus = useCallback(
    (container: HTMLElement | null) => {
      if (!keyboardTraps || !container) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    },
    [keyboardTraps]
  );

  // Get accessible color contrast
  const getContrastColor = useCallback((backgroundColor: string) => {
    // Use design token colors for accessible contrast
    // For production, consider using a proper color contrast library

    // Predefined color mappings using design tokens
    const colorMappings: Record<string, string> = {
      // Light backgrounds need dark text
      '#FFFFFF': 'hsl(var(--foreground))', // white -> dark
      '#F8FAFC': 'hsl(var(--foreground))', // surface -> dark
      '#F1F5F9': 'hsl(var(--foreground))', // border-light -> dark
      '#E2E8F0': 'hsl(var(--foreground))', // border -> dark

      // Dark backgrounds need light text
      '#0F172A': 'hsl(var(--background))', // primary-dark -> light
      '#1E293B': 'hsl(var(--background))', // primary-main -> light
      '#334155': 'hsl(var(--background))', // primary-light -> light
      '#8B1538': 'hsl(var(--background))', // brand-red -> light

      // Medium backgrounds need high contrast
      '#64748B': 'hsl(var(--background))', // text-secondary -> light
      '#94A3B8': 'hsl(var(--foreground))', // text-muted -> dark
    };

    // Return predefined mapping or calculate fallback
    if (colorMappings[backgroundColor]) {
      return colorMappings[backgroundColor];
    }

    // Fallback: simple luminance calculation for unknown colors
    const hex = backgroundColor.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5
        ? 'hsl(var(--foreground))'
        : 'hsl(var(--background))';
    }

    // Default fallback
    return 'hsl(var(--foreground))';
  }, []);

  // Check if element is visible to screen readers
  const isElementAccessible = useCallback((element: HTMLElement) => {
    const style = window.getComputedStyle(element);

    return !(
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      element.getAttribute('aria-hidden') === 'true' ||
      element.hasAttribute('hidden')
    );
  }, []);

  // Generate unique IDs for ARIA relationships
  const generateId = useCallback((prefix: string = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Validate ARIA attributes
  const validateAria = useCallback((element: HTMLElement) => {
    const warnings: string[] = [];

    // Check for common ARIA issues
    if (element.getAttribute('aria-labelledby')) {
      const labelId = element.getAttribute('aria-labelledby');
      if (labelId && !document.getElementById(labelId)) {
        warnings.push(
          `aria-labelledby references non-existent element: ${labelId}`
        );
      }
    }

    if (element.getAttribute('aria-describedby')) {
      const descId = element.getAttribute('aria-describedby');
      if (descId && !document.getElementById(descId)) {
        warnings.push(
          `aria-describedby references non-existent element: ${descId}`
        );
      }
    }

    return warnings;
  }, []);

  return {
    // State
    isReducedMotion,
    isHighContrast,
    isKeyboardUser,

    // Announcements
    announce,

    // Focus management
    saveFocus,
    restoreFocus,
    focusFirst,
    focusLast,
    trapFocus,

    // Utilities
    getContrastColor,
    isElementAccessible,
    generateId,
    validateAria,
  };
}

// Hook for managing keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Create a key combination string
      const keys = [];
      if (event.ctrlKey) keys.push('ctrl');
      if (event.altKey) keys.push('alt');
      if (event.shiftKey) keys.push('shift');
      if (event.metaKey) keys.push('meta');
      keys.push(event.key.toLowerCase());

      const combination = keys.join('+');

      if (shortcuts[combination]) {
        event.preventDefault();
        shortcuts[combination]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Hook for managing focus indicators
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}
