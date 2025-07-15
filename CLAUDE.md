# ValueMax Vampire Frontend - Development Context

## 🔧 DEVELOPMENT PHASE

### Project Overview
- **Mission**: Modern web application for ValueMax pawnshop operations, replacing legacy desktop system
- **Architecture**: Single Page Application (SPA) with real-time features
- **Tech Stack**: 
  - Frontend: React 18.2 + TypeScript 5.4 + Vite 5.2
  - UI Framework: shadcn/ui components with Tailwind CSS 3.4
  - State Management: Zustand 4.4 + TanStack Query 5.28
  - Form Handling: React Hook Form 7.51 + Zod 3.22 validation
  - Testing: Vitest + React Testing Library + Playwright
  - Infrastructure: Web-based deployment with API integration

### Development Standards
- **Code Quality**: ESLint + Prettier with TypeScript strict mode
- **Language**: TypeScript (strict) with React JSX
- **Package Manager**: npm with exact version locking
- **Environment Management**: .env files with Vite environment variables
- **Version Control**: Git Flow with feature branches and comprehensive testing

### Common Commands
- `npm run dev`: Start development server (http://localhost:5173)
- `npm run build`: Build production version with optimization
- `npm run test`: Run comprehensive test suite (unit + integration)
- `npm run lint`: ESLint code quality checks with auto-fix
- `npm run type-check`: TypeScript strict validation

## 🎨 FRONTEND ENGINEERING

### UI Framework & Component System
- **Framework**: React 18.2 with TypeScript strict mode
- **Component Library**: shadcn/ui for consistent, accessible components
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **State Management**: Zustand for global state + TanStack Query for server state
- **Build Tool**: Vite 5.2 with optimized bundling and HMR

### Design System & Tokens
- **Design Tokens**: Centralized design system with CSS custom properties
- **Components**: shadcn/ui atomic components with ValueMax branding
- **Accessibility**: WCAG 2.1 AA compliance with comprehensive keyboard navigation
- **Responsive**: Mobile-first design with breakpoint-based layouts
- **Theme System**: CSS-in-JS compatible with dark/light mode support

### Key Design Principles
- **Professional Reliability**: Clean interfaces communicating trust and competence
- **Muscle Memory Preservation**: Maintain legacy keyboard shortcuts (Enter, Tab, Escape)
- **Type Safety**: Comprehensive TypeScript coverage with strict mode
- **Performance**: < 2s initial load, < 100ms keyboard response, < 500ms search
- **Accessibility**: Full keyboard navigation, screen reader support, proper focus management

## 🛠️ CRITICAL BUSINESS REQUIREMENTS

### Core Functions (100% Type Safe)
1. **FUNC-01: Ticket Renewal** - Single/multiple ticket renewal with payment processing
2. **FUNC-02: Ticket Redemption** - Customer redemption with redeemer validation
3. **FUNC-03: Universal Enquiry** - Smart search across customers/tickets/transactions
4. **FUNC-04: Lost Pledge Reporting** - Single/multiple lost item processing
5. **FUNC-05: Lost Letter Reprinting** - Receipt-based document regeneration
6. **FUNC-06: Combined Operations** - Simultaneous renewal/redemption processing
7. **FUNC-07: Credit Rating Assessment** - Customer risk evaluation

### Business Rules (Enforced via TypeScript)
- **Ticket Status Management**: U (Active) → R (Renewed/Redeemed), O (Reopened)
- **Payment Validation**: Collected Amount ≥ Total Amount (strictly enforced)
- **Authentication**: Single staff (standard) / Dual staff (different redeemer)
- **Data Integrity**: Real-time validation with immediate user feedback

### Performance Requirements
- **Keyboard Response**: < 100ms for Enter/Tab navigation
- **Form Submission**: < 1 second for transaction processing
- **Search Operations**: < 500ms for customer/ticket lookup
- **Page Navigation**: < 2 seconds initial load

## 🧪 TESTING STRATEGY

### Test Types & Coverage
- **Unit Testing**: Vitest with 80% coverage minimum (90% for business logic)
- **Integration Testing**: React Testing Library for component integration
- **E2E Testing**: Playwright for complete user journey validation
- **Type Safety**: TypeScript strict mode with comprehensive type coverage

### Test Environment
- **Local Testing**: Vitest with jsdom environment and MSW mocking
- **CI Testing**: GitHub Actions with full test suite and coverage reporting
- **Test Data**: Mock service worker with realistic pawnshop data fixtures

## 🎯 UI/UX CRITICAL PATTERNS

### Command Palette Integration
- **Primary Access**: Ctrl+K / Cmd+K universal shortcut
- **Secondary Access**: / key for quick command entry
- **Search Integration**: Unified search across commands, customers, tickets
- **Keyboard Navigation**: Full arrow key navigation with instant preview
- **Context Awareness**: Smart command suggestions based on current page

### Keyboard Navigation (Legacy Preservation)
- **Enter Key**: Primary action trigger (ticket lookup, form submission)
- **Tab Navigation**: Logical field progression with visual focus indicators
- **Escape Key**: Universal cancel/back action with state preservation
- **F-Keys**: F1 (Help), F3 (Search), F5 (Refresh), F12 (Staff Auth)

### Form Interaction Patterns
- **Real-time Validation**: Zod schema validation with immediate feedback
- **Auto-formatting**: Ticket numbers (B/MMYY/XXXX), currency, dates
- **Error Recovery**: Clear error messages with actionable next steps
- **Smart Defaults**: Pre-populate based on context and user history

### Data Display Standards
- **Monetary Values**: Right-aligned, monospace font, currency formatting
- **Status Indicators**: Color-coded badges with semantic meaning
- **Loading States**: Skeleton screens and progress indicators
- **Error States**: Graceful degradation with retry mechanisms

## 🔐 SECURITY & VALIDATION

### TypeScript Safety Requirements
- **Strict Mode**: No implicit any, strict null checks, strict function types
- **Schema Validation**: Zod schemas for all API responses and form inputs
- **Type Guards**: Runtime type checking for critical business logic
- **API Integration**: Fully typed API client with error handling

### Authentication & Authorization
- **Staff Authentication**: JWT-based with session management
- **Dual Staff Validation**: Required for sensitive operations (different redeemer)
- **Session Timeout**: Automatic logout with activity monitoring
- **Audit Logging**: Comprehensive transaction logging for compliance

## 📱 COMMAND PALETTE FUNCTIONALITY

### Core Features
- **Universal Search**: `/search [query]` - Search customers, tickets, transactions
- **Quick Actions**: `/renew`, `/redeem`, `/enquiry`, `/lost`, `/combined`, `/credit`
- **Navigation**: `/dashboard`, `/help`, `/settings`, `/logout`
- **Data Operations**: `/export`, `/print`, `/backup`

### Advanced Commands
- **Transaction Shortcuts**: `/renew [ticket]`, `/redeem [ticket]`, `/find [customer]`
- **System Operations**: `/refresh`, `/sync`, `/status`, `/debug`
- **Help System**: `/help [topic]`, `/shortcuts`, `/about`
- **Quick Settings**: `/theme`, `/notifications`, `/preferences`

### Implementation Requirements
- **Performance**: < 50ms search response time
- **Fuzzy Search**: Intelligent matching with typo tolerance
- **Recent Items**: Smart suggestions based on usage patterns
- **Keyboard Only**: Complete functionality without mouse interaction

## 🚨 CRITICAL DEVELOPMENT GUIDELINES

### Component Development Standards
1. **Use shadcn/ui components exclusively** - No custom UI primitives
2. **Implement comprehensive TypeScript types** - Interface every prop and state
3. **Follow design token system** - Use CSS custom properties for all styling
4. **Ensure keyboard accessibility** - Test every interaction with Tab/Enter/Escape
5. **Validate with Zod schemas** - Runtime type safety for all external data

### Code Quality Requirements
- **TypeScript Strict**: Zero `any` types, comprehensive interface coverage
- **Component Props**: Fully typed with required/optional distinction
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **Performance**: Lazy loading, code splitting, optimized re-renders
- **Testing**: Every component and business function has comprehensive tests

### Business Logic Integration
- **API Integration**: Fully typed client with error handling and loading states
- **State Management**: Zustand stores with TypeScript interfaces
- **Form Handling**: React Hook Form with Zod validation schemas
- **Real-time Updates**: WebSocket integration for live transaction updates

### File Organization
```
src/
├── components/ui/          # shadcn/ui components with custom styling
├── components/business/    # Business-specific components (TicketLookup, PaymentForm)
├── components/layout/      # Layout components (AppLayout, CommandPalette)
├── hooks/                  # Custom hooks (useTicketLookup, usePayment, useAuth)
├── stores/                 # Zustand stores (auth, transactions, ui)
├── types/                  # TypeScript definitions (api, business, ui)
├── lib/                    # Utilities (validation, formatting, api client)
├── pages/                  # Page components (Dashboard, Renewals, etc.)
```

## 💡 DEVELOPMENT FOCUS AREAS

### Immediate Priorities
1. **Component Library Setup**: shadcn/ui installation and configuration
2. **Design Token Implementation**: CSS custom properties with Tailwind integration
3. **TypeScript Configuration**: Strict mode setup with comprehensive type coverage
4. **Command Palette**: Universal search and navigation system
5. **Form Architecture**: React Hook Form + Zod validation framework

### Quality Assurance
- **Type Safety**: 100% TypeScript coverage with strict mode
- **Accessibility**: WCAG 2.1 AA compliance verification
- **Performance**: Core Web Vitals optimization
- **Business Logic**: Comprehensive test coverage for all transaction flows
- **User Experience**: Keyboard navigation and muscle memory preservation

---

## ⚡ QUICK REFERENCE

### Essential Keyboard Shortcuts
- `Ctrl+K` / `Cmd+K`: Command Palette
- `Enter`: Execute primary action
- `Tab`: Navigate between fields
- `Escape`: Cancel/back navigation
- `F1`: Context help
- `F3`: Quick search
- `F5`: Refresh data

### Core Component Patterns
- Use `<Button variant="primary">` for main actions
- Use `<Input>` with Zod validation for all form fields
- Use `<Table>` for data display with proper typing
- Use `<Command>` for search and navigation interfaces
- Use `<Card>` for information grouping and layout

### Type Safety Checklist
- [ ] All components have TypeScript interfaces
- [ ] API responses validated with Zod schemas
- [ ] Form inputs use React Hook Form + Zod
- [ ] State management typed with Zustand
- [ ] No `any` types in production code

**Last Updated**: July 10, 2025  
**Project Phase**: Active Development  
**Team**: 1CloudHub Development Team
