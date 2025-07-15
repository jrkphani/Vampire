# ValueMax Vampire Frontend Documentation

Welcome to the ValueMax Vampire Frontend project documentation. This modern web application replaces the legacy desktop system used by ValueMax pawnshop outlet staff for day-to-day operations.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Documentation Structure](#documentation-structure)
- [Development Workflow](#development-workflow)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)

## 🎯 Project Overview

The Vampire Frontend is a comprehensive web application designed for ValueMax pawnshop outlet staff to efficiently process:

- **Ticket Renewals** - Single and multiple ticket renewal processing
- **Redemptions** - Customer ticket redemption with flexible redeemer validation
- **Customer Enquiry** - Universal search across customers, tickets, and transactions
- **Lost Pledge Management** - Report and track lost items
- **Combined Operations** - Simultaneous renewal and redemption processing
- **Credit Rating** - Customer creditworthiness assessment

## 🚀 Quick Start

```bash
# Clone the repository
git clone [repository-url]
cd vampire

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## 📚 Documentation Structure

### Core Documentation
- [`business-requirements.md`](./business-requirements.md) - Complete BRD with functional specifications
- [`technical-specifications.md`](./technical-specifications.md) - Architecture and technical details
- [`design-system.md`](./design-system.md) - UI/UX guidelines and component specifications

### Development Guides
- [`development-setup.md`](./development-setup.md) - Environment setup and tooling
- [`component-library.md`](./component-library.md) - Reusable component documentation
- [`api-integration.md`](./api-integration.md) - Backend integration guidelines

### User Experience
- [`user-workflows.md`](./user-workflows.md) - Staff interaction patterns and workflows
- [`keyboard-shortcuts.md`](./keyboard-shortcuts.md) - Essential shortcuts for efficiency
- [`accessibility.md`](./accessibility.md) - WCAG compliance and inclusive design

### Quality Assurance
- [`testing-strategy.md`](./testing-strategy.md) - Testing approach and standards
- [`deployment-guide.md`](./deployment-guide.md) - Production deployment procedures

## 💼 Development Workflow

1. **Review Requirements** - Start with `business-requirements.md`
2. **Setup Environment** - Follow `development-setup.md`
3. **Design Implementation** - Reference `design-system.md`
4. **Component Development** - Use `component-library.md`
5. **Testing** - Apply `testing-strategy.md`
6. **Deployment** - Execute `deployment-guide.md`

## ✨ Key Features

### Transaction Processing
- **Muscle Memory Preservation** - Maintains legacy keyboard shortcuts
- **Real-time Validation** - Immediate feedback on data entry
- **Multi-step Workflows** - Guided transaction processing
- **Error Recovery** - Comprehensive error handling and recovery

### Search & Enquiry
- **Universal Search** - Single input for multiple search types
- **Smart Recognition** - Auto-detects input format (ID, name, ticket)
- **Advanced Filtering** - Date ranges, status filters, and more
- **Export Capabilities** - Data export for reporting

### User Experience
- **Professional Design** - Clean, trust-inspiring interface
- **Responsive Layout** - Works across desktop, tablet, and mobile
- **Accessibility First** - WCAG 2.1 AA compliant
- **Performance Optimized** - Fast loading and smooth interactions

## 🛠 Technology Stack

### Frontend Framework
- **React 18.2** - Modern React with concurrent features
- **TypeScript 5.4** - Type-safe development
- **Vite 5.2** - Fast build tooling and HMR

### State Management & Data
- **Zustand 4.4** - Lightweight state management
- **React Query 5.28** - Server state management and caching
- **React Hook Form 7.51** - Performant forms with validation
- **Zod 3.22** - Runtime type validation

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React 0.323** - Modern icon library
- **CSS-in-JS Ready** - Styled-components compatible

### Development Tools
- **React Router 6.22** - Client-side routing
- **Testing Library** - Component and integration testing
- **Vitest** - Fast unit testing
- **ESLint & Prettier** - Code quality and formatting

## 📞 Support & Contribution

### Getting Help
- Review relevant documentation in this `/docs` folder
- Check the component library for existing solutions
- Follow the testing strategy for quality assurance

### Development Standards
- Follow TypeScript strict mode guidelines
- Implement comprehensive testing for all features
- Maintain accessibility standards (WCAG 2.1 AA)
- Preserve keyboard navigation patterns from legacy system

### Performance Requirements
- Initial page load: < 2 seconds
- Form submissions: < 1 second response
- Search operations: < 500ms
- Keyboard shortcuts: < 100ms response time

---

**Project Version:** 1.0  
**Last Updated:** July 2025  
**Maintained by:** 1CloudHub Development Team
