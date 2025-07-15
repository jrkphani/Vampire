# Setup Development Environment

Set up complete development environment for ValueMax Vampire Frontend: $ARGUMENTS

## Prerequisites Validation
1. **Node.js & npm**
   - Verify Node.js 18.x or higher: `node --version`
   - Verify npm 9.x or higher: `npm --version`
   - Update if needed: `npm install -g npm@latest`

2. **Development Tools**
   - Install VS Code with recommended extensions
   - Configure Git with proper credentials
   - Set up TypeScript globally: `npm install -g typescript`

## Project Dependencies
1. **Core Installation**
   ```bash
   npm install
   npm audit fix
   ```

2. **shadcn/ui Setup**
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add table
   npx shadcn-ui@latest add command
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add form
   npx shadcn-ui@latest add toast
   ```

3. **TypeScript Configuration**
   - Verify tsconfig.json strict mode is enabled
   - Run type checking: `npm run type-check`
   - Fix any type errors before proceeding

## Environment Configuration
1. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Configure API endpoints and authentication
   - Set up development database connections

2. **Design Tokens Setup**
   - Verify Tailwind CSS configuration
   - Test design token CSS custom properties
   - Validate theme switching functionality

3. **Command Palette Integration**
   - Test Ctrl+K / Cmd+K shortcut functionality
   - Verify search performance (<50ms response)
   - Validate keyboard navigation (arrow keys, enter, escape)

## Development Server
1. **Start Services**
   ```bash
   npm run dev
   ```
   - Application: http://localhost:5173
   - Type checking in watch mode
   - Hot module replacement enabled

2. **Quality Verification**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

3. **Component Library Verification**
   - Test shadcn/ui component rendering
   - Verify design token application
   - Check TypeScript intellisense

## Business Logic Setup
1. **Mock Data Configuration**
   - Set up MSW (Mock Service Worker)
   - Configure realistic pawnshop transaction data
   - Test API integration with proper TypeScript types

2. **Form Validation Setup**
   - Configure React Hook Form with Zod schemas
   - Test ticket number validation (B/MMYY/XXXX format)
   - Verify payment amount validation

3. **Authentication Flow**
   - Test staff code/PIN authentication
   - Verify session management
   - Check dual staff authentication for sensitive operations

## Verification Checklist
- [ ] Development server starts successfully
- [ ] TypeScript compilation passes with strict mode
- [ ] shadcn/ui components render correctly
- [ ] Command palette responds to Ctrl+K/Cmd+K
- [ ] Design tokens apply correctly
- [ ] Form validation works with Zod schemas
- [ ] Mock API responses are properly typed
- [ ] All tests pass
- [ ] Lint checks pass
- [ ] Keyboard navigation works (Tab, Enter, Escape)

Usage: `/setup-environment [component-name]`
Example: `/setup-environment ticket-renewal`
