# Quality Check Command

Run comprehensive quality validation for ValueMax Vampire Frontend:

## Code Quality Assessment
1. **TypeScript Strict Mode**
   ```bash
   npm run type-check
   ```
   - Zero `any` types allowed
   - Strict null checks enabled
   - All components properly typed
   - API responses validated with Zod schemas

2. **Linting & Formatting**
   ```bash
   npm run lint
   npm run lint:fix
   npm run format
   ```
   - ESLint rules for React/TypeScript
   - Prettier formatting consistency
   - Import organization and unused imports
   - Accessibility linting (jsx-a11y)

3. **Component Standards**
   - Verify shadcn/ui component usage only
   - Check design token compliance
   - Validate prop interface definitions
   - Ensure keyboard accessibility patterns

## Testing Validation
1. **Unit & Integration Tests**
   ```bash
   npm run test
   npm run test:coverage
   ```
   - Minimum 80% coverage overall
   - 90% coverage for business logic components
   - All business functions tested
   - Component rendering and interaction tests

2. **Type Safety Testing**
   ```bash
   npm run test:types
   ```
   - Zod schema validation tests
   - API response type checking
   - Form validation schema tests
   - Error boundary testing

3. **E2E Critical Flows**
   ```bash
   npm run test:e2e
   ```
   - Complete ticket renewal workflow
   - Customer search and enquiry flows
   - Payment processing validation
   - Command palette functionality

## Business Logic Validation
1. **Transaction Flow Testing**
   - Ticket number format validation (B/MMYY/XXXX)
   - Payment amount validation (collected ≥ total)
   - Staff authentication flows
   - Status transition rules (U/O → R)

2. **Data Integrity Checks**
   - Form validation with Zod schemas
   - API response error handling
   - State management consistency
   - Real-time validation feedback

3. **User Experience Validation**
   - Keyboard navigation (Tab, Enter, Escape)
   - Command palette responsiveness (<50ms)
   - Loading states and error boundaries
   - Accessibility compliance (WCAG 2.1 AA)

## Performance Audit
1. **Build Analysis**
   ```bash
   npm run build
   npm run analyze
   ```
   - Bundle size optimization
   - Code splitting effectiveness
   - Tree shaking validation
   - Asset optimization

2. **Runtime Performance**
   - Initial page load (<2 seconds)
   - Keyboard response time (<100ms)
   - Search performance (<500ms)
   - Memory leak detection

3. **Core Web Vitals**
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

## Security Assessment
1. **Dependency Audit**
   ```bash
   npm audit
   npm audit fix
   ```
   - Vulnerability scanning
   - License compliance check
   - Dependency version management

2. **Type Safety Security**
   - Input validation with Zod
   - XSS prevention through proper escaping
   - Authentication token handling
   - Session management security

3. **Data Protection**
   - Sensitive data masking (PINs, NRICs)
   - Audit logging implementation
   - Access control validation

## shadcn/ui Component Compliance
1. **Component Usage Validation**
   - Only shadcn/ui components used for UI primitives
   - Proper component composition patterns
   - Custom styling through design tokens only
   - Accessibility props correctly applied

2. **Design Token Adherence**
   - CSS custom properties usage
   - Theme consistency validation
   - Color contrast compliance
   - Typography scale adherence

## Command Palette Quality
1. **Functionality Testing**
   - Ctrl+K / Cmd+K shortcut response
   - Search performance and accuracy
   - Keyboard navigation completeness
   - Command execution reliability

2. **Integration Testing**
   - Universal search across data types
   - Context-aware command suggestions
   - Recent items and usage patterns
   - Error handling and recovery

## Quality Gate Criteria
- [ ] TypeScript compilation passes with zero errors
- [ ] All tests pass with required coverage
- [ ] Lint checks pass with zero warnings
- [ ] Performance benchmarks met
- [ ] Security audit clean
- [ ] shadcn/ui compliance verified
- [ ] Command palette functionality confirmed
- [ ] Accessibility requirements met
- [ ] Business logic validation successful

Report any issues found with specific remediation steps and priority levels.

Usage: `/quality-check`
Auto-runs: Pre-commit hooks, CI/CD pipeline, release preparation
