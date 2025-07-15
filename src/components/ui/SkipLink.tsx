import { clsx } from 'clsx';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={clsx(
        'skip-link',
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
}

// Screen reader only component
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenReaderOnly({
  children,
  className,
}: ScreenReaderOnlyProps) {
  return (
    <span className={clsx('sr-only', className)} aria-hidden={false}>
      {children}
    </span>
  );
}

// Live region for dynamic content announcements
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = false,
  className,
}: LiveRegionProps) {
  return (
    <div
      className={clsx('sr-only', className)}
      aria-live={politeness}
      aria-atomic={atomic}
      role='status'
    >
      {children}
    </div>
  );
}

// Keyboard navigation helper
interface KeyboardNavigationProps {
  children: React.ReactNode;
  onNavigate?: (
    direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end'
  ) => void;
  className?: string;
}

export function KeyboardNavigation({
  children,
  onNavigate,
  className,
}: KeyboardNavigationProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!onNavigate) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onNavigate('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        onNavigate('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onNavigate('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        onNavigate('right');
        break;
      case 'Home':
        event.preventDefault();
        onNavigate('home');
        break;
      case 'End':
        event.preventDefault();
        onNavigate('end');
        break;
    }
  };

  return (
    <div
      className={className}
      onKeyDown={handleKeyDown}
      role='navigation'
      aria-label='Keyboard navigation'
    >
      {children}
    </div>
  );
}

// Focus trap component
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export function FocusTrap({
  children,
  active = true,
  className,
}: FocusTrapProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!active || event.key !== 'Tab') return;

    const focusableElements = (
      event.currentTarget as HTMLElement
    ).querySelectorAll(
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

  return (
    <div
      className={className}
      onKeyDown={handleKeyDown}
      role='dialog'
      aria-modal='true'
    >
      {children}
    </div>
  );
}

// Landmark component for better navigation
interface LandmarkProps {
  children: React.ReactNode;
  role:
    | 'main'
    | 'navigation'
    | 'banner'
    | 'contentinfo'
    | 'complementary'
    | 'region';
  label?: string;
  className?: string;
}

export function Landmark({ children, role, label, className }: LandmarkProps) {
  return (
    <div className={className} role={role} aria-label={label}>
      {children}
    </div>
  );
}

// Heading component with proper hierarchy
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Heading({ level, children, className, id }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      id={id}
      className={clsx(
        'font-semibold text-text-primary',
        {
          'text-2xl': level === 1,
          'text-xl': level === 2,
          'text-lg': level === 3,
          'text-base': level === 4,
          'text-sm': level === 5,
          'text-xs': level === 6,
        },
        className
      )}
    >
      {children}
    </Tag>
  );
}
