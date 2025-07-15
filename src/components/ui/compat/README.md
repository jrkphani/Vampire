# shadcn/ui Compatibility Layer

This directory contains compatibility wrappers to help gradually migrate from custom UI components to shadcn/ui components while maintaining backward compatibility.

## Purpose

The compatibility layer allows us to:

1. Update imports without changing component APIs
2. Gradually migrate components one at a time
3. Maintain existing functionality during migration
4. Reduce the risk of breaking changes

## Usage

### For Gradual Migration

Instead of updating all component usages at once, simply update the import:

```tsx
// Before
import { Input } from '@/components/ui/Input';

// After (using compatibility layer)
import { Input } from '@/components/ui/compat';
```

### Available Components

- **Input**: Wrapper that maintains the legacy API (label, error, helper props) while using shadcn/ui's base input
- **Button**: Direct re-export (no compatibility needed)
- **Card**: Direct re-export (no compatibility needed)

### Form Components

The compatibility layer also re-exports shadcn/ui form components for use in fully migrated components:

```tsx
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/compat';
```

## Migration Strategy

1. **Phase 1**: Update imports to use compatibility layer
2. **Phase 2**: Gradually migrate components to use shadcn/ui Form components with react-hook-form
3. **Phase 3**: Remove compatibility wrappers once all components are migrated

## Example Migration

### Before (Custom Component)

```tsx
<Input
  label='Staff Code'
  value={staffCode}
  onChange={handleChange}
  error={error}
  helper='Enter your staff code'
/>
```

### After (Using shadcn/ui with react-hook-form)

```tsx
<FormField
  control={form.control}
  name='staffCode'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Staff Code</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>Enter your staff code</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Components Status

- ✅ StaffAuthentication - Migrated with compatibility layer
- ✅ TicketLookup - Migrated with compatibility layer
- ✅ PaymentForm - Migrated with compatibility layer
- ✅ CustomerForm - Migrated with compatibility layer
- ⏳ Other business components - Pending migration
