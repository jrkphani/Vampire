# Development Setup Guide

## Prerequisites

### Required Software
- **Node.js** 18.x or higher
- **npm** 9.x or higher (comes with Node.js)
- **Git** 2.x or higher
- **VS Code** (recommended) or your preferred IDE

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

## Project Setup

### 1. Clone Repository
```bash
git clone [repository-url]
cd vampire
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create environment files:

#### `.env.local` (Development)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws

# Database Connection
VITE_DB_HOST=localhost
VITE_DB_NAME=waterloo_march2025

# Authentication
VITE_JWT_SECRET=your-development-jwt-secret
VITE_SESSION_TIMEOUT=28800000

# Print Service
VITE_PRINT_SERVICE_URL=http://localhost:3001

# Feature Flags
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_OFFLINE_MODE=false

# Monitoring
VITE_ANALYTICS_ENABLED=false
VITE_ERROR_REPORTING_ENABLED=true
```

#### `.env.staging` (Staging)
```env
# API Configuration
VITE_API_BASE_URL=https://staging-api.valuemax.com/api
VITE_WS_URL=wss://staging-api.valuemax.com/ws

# Database Connection
VITE_DB_HOST=staging-db.valuemax.com
VITE_DB_NAME=waterloo_staging

# Authentication
VITE_JWT_SECRET=staging-jwt-secret
VITE_SESSION_TIMEOUT=28800000

# Print Service
VITE_PRINT_SERVICE_URL=https://staging-print.valuemax.com

# Feature Flags
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_OFFLINE_MODE=true

# Monitoring
VITE_ANALYTICS_ENABLED=true
VITE_ERROR_REPORTING_ENABLED=true
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development Scripts

### Available Commands
```bash
# Development
npm run dev              # Start development server
npm run dev:host         # Start dev server accessible on network
npm run dev:https        # Start dev server with HTTPS

# Building
npm run build            # Production build
npm run build:staging    # Staging build
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed development data
npm run db:reset         # Reset and reseed database
```

## Development Workflow

### 1. Branch Strategy
```bash
# Feature development
git checkout -b feature/FUNC-01-ticket-renewal
git checkout -b feature/FUNC-03-enquiry-system
git checkout -b bugfix/payment-validation

# Create pull request when complete
git push origin feature/FUNC-01-ticket-renewal
```

### 2. Commit Convention
```bash
# Format: type(scope): description
git commit -m "feat(transactions): implement ticket renewal flow"
git commit -m "fix(validation): resolve payment amount calculation"
git commit -m "docs(api): update authentication endpoints"
git commit -m "test(forms): add validation test coverage"
```

### 3. Code Review Checklist
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] ESLint rules satisfied
- [ ] Prettier formatting applied
- [ ] Accessibility standards met
- [ ] Performance requirements satisfied
- [ ] Security considerations addressed

## Project Structure

```
vampire/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base components (Button, Input, etc.)
│   │   ├── forms/           # Form-specific components
│   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   └── business/        # Business logic components
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard views
│   │   ├── transactions/    # Transaction processing
│   │   ├── enquiry/         # Search and enquiry
│   │   └── reports/         # Reporting interfaces
│   ├── hooks/               # Custom React hooks
│   │   ├── api/             # API integration hooks
│   │   ├── forms/           # Form handling hooks
│   │   └── utils/           # Utility hooks
│   ├── services/            # API and external services
│   │   ├── api/             # API client configuration
│   │   ├── auth/            # Authentication services
│   │   ├── print/           # Print service integration
│   │   └── validation/      # Data validation services
│   ├── stores/              # Global state management
│   │   ├── auth.ts          # Authentication state
│   │   ├── transactions.ts  # Transaction state
│   │   └── ui.ts            # UI state
│   ├── types/               # TypeScript type definitions
│   │   ├── api.ts           # API response types
│   │   ├── business.ts      # Business domain types
│   │   └── ui.ts            # UI component types
│   ├── utils/               # Utility functions
│   │   ├── formatting.ts    # Data formatting
│   │   ├── validation.ts    # Input validation
│   │   └── constants.ts     # Application constants
│   └── styles/              # Global styles
│       ├── globals.css      # Global CSS
│       ├── components.css   # Component styles
│       └── utilities.css    # Utility classes
├── public/                  # Static assets
├── docs/                    # Project documentation
└── tests/                   # Test files
    ├── unit/                # Unit tests
    ├── integration/         # Integration tests
    └── e2e/                 # End-to-end tests
```

## IDE Configuration

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.experimental.classRegex": [
    "clsx\\(([^)]*)\\)",
    "className\\s*:\\s*['\"`]([^'\"`]*)['\"`]"
  ]
}
```

### VS Code Tasks
Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "isBackground": true
    },
    {
      "label": "test",
      "type": "npm",
      "script": "test",
      "group": "test"
    },
    {
      "label": "build",
      "type": "npm",
      "script": "build",
      "group": "build"
    }
  ]
}
```

## Configuration Files

### TypeScript Configuration
`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite Configuration
`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          utils: ['date-fns', 'numeral', 'clsx']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
})
```

### ESLint Configuration
`.eslintrc.cjs`:
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint', 'jsx-a11y'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
```

### Prettier Configuration
`.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Tailwind Configuration
`tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#1E293B',
          dark: '#0F172A',
          light: '#334155'
        },
        brand: {
          red: '#8B1538',
          gold: '#F59E0B',
          'gold-light': '#FCD34D'
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
```

## Mock Data Setup

### Development Mock Server
Create `src/mocks/server.ts`:
```typescript
import { setupWorker } from 'msw'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// Start mock server in development
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_DATA === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass'
  })
}
```

### Mock Data Handlers
Create `src/mocks/handlers/index.ts`:
```typescript
import { rest } from 'msw'

export const handlers = [
  // Authentication
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-jwt-token',
        staff: {
          id: '1',
          code: 'SC001',
          name: 'Sarah Chen',
          role: 'Senior Staff'
        }
      })
    )
  }),

  // Ticket lookup
  rest.get('/api/tickets/:ticketNo', (req, res, ctx) => {
    const { ticketNo } = req.params
    return res(
      ctx.status(200),
      ctx.json({
        ticketNo,
        customer: {
          name: 'John Tan Wei Ming',
          nric: 'S1234567A'
        },
        pledge: {
          amount: 800,
          interest: 24,
          weight: '15.2g'
        },
        status: 'U'
      })
    )
  })
]
```

## Database Setup (Development)

### Local Database Connection
```bash
# Install database tools (if using PostgreSQL)
npm install -g pg-dump
npm install -g pg-restore

# Create development database
createdb waterloo_development

# Run migrations
npm run db:migrate

# Seed with test data
npm run db:seed
```

### Sample Data Generation
Create `scripts/generate-sample-data.ts`:
```typescript
import { faker } from '@faker-js/faker'

interface Customer {
  nric: string
  name: string
  contact: string
  address: string
}

function generateCustomers(count: number): Customer[] {
  return Array.from({ length: count }, () => ({
    nric: `S${faker.number.int({ min: 1000000, max: 9999999 })}A`,
    name: faker.person.fullName(),
    contact: faker.phone.number(),
    address: faker.location.streetAddress()
  }))
}

// Generate and save sample data
const customers = generateCustomers(100)
console.log('Generated sample customers:', customers)
```

## Debugging Tools

### React Developer Tools
Install browser extensions:
- React Developer Tools
- Redux DevTools (if using Redux)

### Development Utilities
Create `src/utils/dev.ts`:
```typescript
export const isDev = import.meta.env.DEV
export const isStaging = import.meta.env.VITE_ENVIRONMENT === 'staging'
export const isProd = import.meta.env.VITE_ENVIRONMENT === 'production'

export const debugLog = (message: string, data?: any) => {
  if (isDev || import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
    console.log(`[DEBUG] ${message}`, data)
  }
}

export const errorLog = (message: string, error?: Error) => {
  console.error(`[ERROR] ${message}`, error)
}
```

## Performance Monitoring

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Performance Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 5173
lsof -ti:5173
# Kill the process
kill -9 <PID>
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

#### Module Resolution Issues
```bash
# Clear all caches
rm -rf node_modules
rm package-lock.json
npm install
```

#### Environment Variables Not Loading
1. Check file naming (`.env.local` vs `.env`)
2. Ensure variables start with `VITE_`
3. Restart development server after changes

### Performance Issues
- Check network tab for slow API calls
- Use React DevTools Profiler
- Monitor bundle size with analyzer
- Enable source maps for debugging

### Build Issues
```bash
# Clean build
rm -rf dist
npm run build

# Check for TypeScript errors
npm run type-check

# Verify all dependencies
npm audit
npm audit fix
```

## Git Hooks Setup

### Pre-commit Hook
Create `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test
```

### Commit Message Hook
Create `.husky/commit-msg`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit $1
```

---

**Document Version:** 1.0  
**Created:** July 10, 2025  
**Development Lead:** 1CloudHub Development Team  
**Last Updated:** July 10, 2025
