# ValueMax Vampire Frontend

Modern web application for ValueMax pawnshop operations, replacing the legacy desktop system with a comprehensive React-based solution.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📋 Project Overview

The Vampire Frontend is a professional web application designed for ValueMax pawnshop outlet staff to efficiently process:

- **Ticket Renewals** - Single and multiple ticket renewal processing
- **Redemptions** - Customer ticket redemption with flexible redeemer validation
- **Customer Enquiry** - Universal search across customers, tickets, and transactions
- **Lost Pledge Management** - Report and track lost items
- **Combined Operations** - Simultaneous renewal and redemption processing
- **Credit Rating** - Customer creditworthiness assessment

## 🛠 Technology Stack

### Core Framework
- **React 18.2** - Modern React with concurrent features
- **TypeScript 5.4** - Type-safe development with strict mode
- **Vite 5.2** - Fast build tooling and HMR

### State Management & Data
- **Zustand 4.4** - Lightweight state management
- **TanStack Query 5.28** - Server state management and caching
- **React Hook Form 7.51** - Performant forms with validation
- **Zod 3.22** - Runtime type validation

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom design tokens
- **Lucide React 0.323** - Modern icon library
- **shadcn/ui pattern** - Consistent, accessible component library

### Development Tools
- **ESLint & Prettier** - Code quality and formatting
- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing
- **MSW** - API mocking for development

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Input, etc.)
│   ├── forms/          # Form-specific components  
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── business/       # Business logic components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard views
│   ├── transactions/   # Transaction processing
│   ├── enquiry/        # Search and enquiry
│   └── reports/        # Reporting interfaces
├── hooks/              # Custom React hooks
│   ├── api/            # API integration hooks
│   ├── forms/          # Form handling hooks
│   └── utils/          # Utility hooks
├── services/           # API and external services
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Global styles
└── mocks/              # MSW mock handlers
```

## 🎨 Design System

### Color Palette
- **Primary**: Modern slate (#1E293B)
- **Brand Red**: ValueMax red (#8B1538) - reserved for primary actions
- **Brand Gold**: Accent gold (#F59E0B) - success states and highlights
- **Semantic**: Success, error, warning, info colors

### Typography
- **Primary**: Inter font family for clean, professional text
- **Monospace**: JetBrains Mono for data display (amounts, codes)

### Component Guidelines
- All components follow accessibility standards (WCAG 2.1 AA)
- Consistent spacing using 8px grid system
- Focus management for keyboard navigation
- Professional styling with subtle hover effects

## ⌨️ Keyboard Navigation

Preserves muscle memory from legacy system:

- **Enter**: Primary action trigger (lookup, submit)
- **Tab**: Logical field progression
- **Escape**: Cancel/back navigation
- **Ctrl+K**: Universal command palette
- **F1**: Context help
- **F3**: Quick search

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: Vitest with 80%+ coverage requirement
- **Integration Tests**: React Testing Library for component interactions
- **E2E Tests**: Playwright for complete user workflows
- **Type Safety**: TypeScript strict mode with comprehensive coverage

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server (http://localhost:5173)
npm run dev:host         # Start dev server accessible on network
npm run dev:https        # Start dev server with HTTPS

# Building
npm run build            # Production build
npm run build:staging    # Staging build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
```

## 🌍 Environment Configuration

### Development (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG_MODE=true
```

### Production
```env
VITE_API_BASE_URL=https://api.valuemax.com/api
VITE_WS_URL=wss://api.valuemax.com/ws
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG_MODE=false
```

## 🔒 Security Features

- **JWT Authentication** with refresh token support
- **Dual staff authorization** for sensitive operations
- **Input validation** with Zod schemas
- **Session management** with automatic timeout
- **Audit logging** for all transactions

## 📊 Performance Requirements

- **Page Load Time**: < 2 seconds
- **Form Submission**: < 1 second response
- **Search Operations**: < 500ms
- **Keyboard Shortcuts**: < 100ms response time

## 🚦 API Integration

### Mock Development
MSW (Mock Service Worker) provides realistic API responses during development:

```typescript
// Enable mocks in development
VITE_ENABLE_MOCK_DATA=true
```

### Production API
Connects to ValueMax backend services:
- Authentication service
- Transaction processing
- Customer database
- Print service integration

## 📝 Business Requirements

### Core Functions
1. **FUNC-01**: Ticket Renewal Process
2. **FUNC-02**: Ticket Redemption Process  
3. **FUNC-03**: Universal Enquiry System
4. **FUNC-04**: Lost Pledge Management
5. **FUNC-05**: Lost Letter Reprinting
6. **FUNC-06**: Combined Operations
7. **FUNC-07**: Credit Rating Assessment

### Validation Rules
- Ticket status management (U → R workflow)
- Payment validation (collected ≥ total)
- Staff authentication requirements
- Customer data integrity

## 🔄 Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/FUNC-01-ticket-renewal
   # Implement feature with tests
   npm run lint && npm run type-check && npm test
   git commit -m "feat(renewals): implement ticket renewal flow"
   ```

2. **Code Quality**
   - ESLint for code standards
   - Prettier for formatting
   - TypeScript strict mode
   - Pre-commit hooks

3. **Testing**
   - Write tests for all business logic
   - Test keyboard navigation
   - Verify accessibility standards
   - Performance testing

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
lsof -ti:5173
kill -9 <PID>
```

**TypeScript Errors**
```bash
rm -rf node_modules/.cache
npm run type-check
```

**Build Issues**
```bash
rm -rf dist node_modules
npm install
npm run build
```

## 📚 Documentation

Comprehensive documentation available in `/docs`:
- `business-requirements.md` - Complete BRD with functional specs
- `technical-specifications.md` - Architecture and technical details
- `design-system.md` - UI/UX guidelines and components
- `user-workflows.md` - Staff interaction patterns
- `development-setup.md` - Environment setup guide

## 🤝 Contributing

1. Follow TypeScript strict mode guidelines
2. Implement comprehensive testing for all features
3. Maintain accessibility standards (WCAG 2.1 AA)
4. Preserve keyboard navigation patterns
5. Use conventional commit messages

## 📄 License

Internal ValueMax project - All rights reserved

---

**Project Version**: 1.0  
**Last Updated**: July 10, 2025  
**Team**: 1CloudHub Development Team