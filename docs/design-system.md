# Design System & UI Guidelines

## Design Philosophy

The ValueMax Vampire Frontend design system balances professional reliability with modern usability, ensuring that outlet staff can perform their daily operations with confidence and efficiency.

### Core Principles

1. **Professional Reliability** - Clean, structured interfaces that communicate trust and competence
2. **Operational Efficiency** - Streamlined workflows designed for high-frequency daily use
3. **Cognitive Clarity** - Minimal visual noise with strategic emphasis on critical information
4. **Respectful Accessibility** - Universal design ensuring all staff can operate effectively
5. **Brand Consistency** - Visual harmony with ValueMax's established brand identity
6. **Performance Focus** - Optimized for speed and responsiveness across all devices

## Color System

### Modern Professional Palette

```css
:root {
  /* Primary Colors - Modern Slate */
  --color-primary-main: #1E293B;
  --color-primary-dark: #0F172A;
  --color-primary-light: #334155;
  
  /* ValueMax Brand Accents (Strategic Use) */
  --color-brand-red: #8B1538;
  --color-brand-gold: #F59E0B;
  --color-brand-gold-light: #FCD34D;
  
  /* Semantic Colors */
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;
  
  /* Neutral Grays */
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-border: #E2E8F0;
  --color-border-light: #F1F5F9;
}
```

### Color Usage Guidelines

#### ValueMax Brand Red (`#8B1538`)
**Reserved exclusively for:**
- ValueMax logo and branding elements
- Primary call-to-action buttons
- Critical error states
- Navigation active indicators

#### Modern Primary (`#1E293B`)
**Used for:**
- Main navigation and sidebars
- Text headers and important content
- Form borders and interactive elements
- General UI structure

#### Brand Gold (`#F59E0B`)
**Applied sparingly for:**
- Success states and confirmations
- Premium feature highlights
- Hover states on secondary elements
- Progress indicators

## Typography

### Font Stack

```css
/* Primary Font - Modern & Clean */
font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

/* Monospace - Data Display */
font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace;
```

### Type Scale

```css
/* Heading Styles */
.text-display {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.text-h1 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  line-height: 1.25;
}

.text-h2 {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 600;
  line-height: 1.3;
}

.text-h3 {
  font-size: clamp(1.125rem, 2vw, 1.25rem);
  font-weight: 600;
  line-height: 1.4;
}

/* Body Text */
.text-body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
}

.text-body-small {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
}

.text-caption {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.3;
  color: var(--color-text-secondary);
}

/* Monospace for Data */
.text-mono {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
}
```

## Spacing System

### Base Unit: 8px System

```css
:root {
  --space-px: 1px;      /* 1px  - hairline borders */
  --space-1: 0.25rem;   /* 4px  */
  --space-2: 0.5rem;    /* 8px  */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px - textarea min-height */
  --space-25: 6.25rem;  /* 100px - large textarea */
  --space-30: 7.5rem;   /* 120px - detailed descriptions */
  --space-32: 8rem;     /* 128px - select min-width */
  --space-75: 18.75rem; /* 300px - command list max-height */
  --space-105: 26.25rem; /* 420px - toast max-width */
}
```

## Component Library

### Buttons

```css
/* Primary Button - Brand Red */
.btn-primary {
  background: var(--color-brand-red);
  color: white;
  border: 1px solid var(--color-brand-red);
  padding: var(--space-4) var(--space-6);
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.025em;
}

.btn-primary:hover {
  background: #6B1028;
  border-color: #6B1028;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Secondary Button - Modern Slate */
.btn-secondary {
  background: var(--color-primary-main);
  color: white;
  border: 1px solid var(--color-primary-main);
  padding: var(--space-4) var(--space-6);
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tertiary Button - Outline */
.btn-tertiary {
  background: transparent;
  color: var(--color-primary-main);
  border: 1px solid var(--color-border);
  padding: var(--space-4) var(--space-6);
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-tertiary:hover {
  background: var(--color-surface);
  border-color: var(--color-primary-main);
}

/* Small variants */
.btn-small {
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  border-radius: 6px;
}
```

### Form Elements

```css
/* Input Fields */
.input-field {
  width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-background);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-brand-red);
  box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
}

.input-field.error {
  border-color: var(--color-error);
}

.input-field.success {
  border-color: var(--color-success);
}

/* Form Labels */
.form-label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
  letter-spacing: -0.025em;
}

.form-label.required::after {
  content: '*';
  color: var(--color-error);
  margin-left: var(--space-1);
}

/* Select Dropdowns */
.select-field {
  width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--color-background);
  cursor: pointer;
}
```

### Data Tables

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid var(--color-border-light);
}

.data-table th {
  background: var(--color-surface);
  padding: var(--space-4);
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  letter-spacing: -0.025em;
}

.data-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.data-table tr:hover {
  background: var(--color-surface);
}

/* Monetary values */
.monetary-value {
  font-family: var(--font-mono);
  font-weight: 600;
  text-align: right;
  color: var(--color-text-primary);
}
```

### Cards & Containers

```css
.card {
  background: white;
  padding: var(--space-6);
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid var(--color-border-light);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

.card-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}
```

### Status Indicators

```css
.status-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.status-active {
  background: var(--color-success);
  color: white;
}

.status-pending {
  background: var(--color-warning);
  color: white;
}

.status-completed {
  background: var(--color-success);
  color: white;
}

.status-error {
  background: var(--color-error);
  color: white;
}

.status-redeemed {
  background: var(--color-text-secondary);
  color: white;
}
```

## Layout System

### Grid System
```css
/* 12-column responsive grid */
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive variants */
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

### Application Shell
```css
.app-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 70px 1fr;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
  height: 100vh;
  background: var(--color-surface);
}

.app-header {
  grid-area: header;
  background: white;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.app-sidebar {
  grid-area: sidebar;
  background: white;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.app-main {
  grid-area: main;
  padding: var(--space-8);
  overflow-y: auto;
  background: var(--color-surface);
}
```

## Navigation Components

### Sidebar Navigation
```css
.sidebar-nav {
  flex: 1;
  padding: var(--space-6) var(--space-4);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: var(--space-1);
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
}

.nav-item:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-brand-red);
  color: white;
  font-weight: 600;
}
```

## Search Interface

```css
.search-container {
  background: white;
  padding: var(--space-8);
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  margin-bottom: var(--space-6);
  border: 1px solid var(--color-border-light);
}

.search-bar {
  position: relative;
  margin-bottom: var(--space-5);
}

.search-input {
  width: 100%;
  padding: var(--space-4) var(--space-6) var(--space-4) 3rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-surface);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-brand-red);
  box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
  background: white;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: 1.125rem;
}
```

## Motion & Animation

### Animation Timing
```css
:root {
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  --easing-ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
  --easing-ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
  --easing-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Common Animations
```css
/* Button interactions */
.btn:hover {
  transform: translateY(-1px);
  transition: transform var(--duration-fast) var(--easing-ease-out);
}

.btn:active {
  transform: translateY(0);
  transition: transform var(--duration-instant) var(--easing-ease-out);
}

/* Card hover effects */
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

/* Loading animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

## Accessibility Guidelines

### Focus Management
```css
.focus-visible {
  outline: 2px solid var(--color-brand-red);
  outline-offset: 2px;
}

/* Hide focus outline for mouse users */
.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}
```

### Screen Reader Support
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
/* Mobile: 0px - 767px */
/* Tablet: 768px - 1023px */  
/* Desktop: 1024px - 1439px */
/* Large: 1440px+ */

@media (max-width: 1024px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 70px auto 1fr;
    grid-template-areas: 
      "header"
      "sidebar"
      "main";
  }

  .app-sidebar {
    display: none; /* Hidden on mobile, show via toggle */
  }
}
```

## Component Usage Examples

### Transaction Form
```html
<form class="transaction-form">
  <div class="form-section">
    <h3 class="text-h3">Ticket Information</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div class="form-group">
        <label class="form-label required" for="ticket-number">
          Ticket Number
        </label>
        <input 
          class="input-field text-mono" 
          type="text" 
          id="ticket-number" 
          placeholder="B/0725/1234"
          required 
        />
        <div class="text-caption">Press Enter to lookup</div>
      </div>
    </div>
  </div>
</form>
```

### Data Display
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Recent Transactions</h3>
  </div>
  <table class="data-table">
    <thead>
      <tr>
        <th>Time</th>
        <th>Ticket #</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>14:23</td>
        <td class="text-mono">B/0725/1234</td>
        <td class="monetary-value">$245.00</td>
        <td><span class="status-badge status-completed">Completed</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

## Design Tokens (JavaScript/TypeScript)

```typescript
export const designTokens = {
  colors: {
    primary: {
      main: '#1E293B',
      dark: '#0F172A',
      light: '#334155'
    },
    brand: {
      red: '#8B1538',
      gold: '#F59E0B',
      goldLight: '#FCD34D'
    },
    semantic: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      muted: '#94A3B8'
    },
    background: {
      default: '#FFFFFF',
      surface: '#F8FAFC'
    },
    border: {
      default: '#E2E8F0',
      light: '#F1F5F9'
    }
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
} as const;
```

---

**Document Version:** 1.0  
**Created:** July 10, 2025  
**Design Lead:** 1CloudHub Design Team  
**Review Cycle:** Bi-weekly
