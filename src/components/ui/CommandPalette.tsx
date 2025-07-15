// Re-export from the shadcn/ui command implementation
import React from 'react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './command';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

// Define types locally for backward compatibility
export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon?: any;
  section?: string;
  shortcut?: string;
  keywords?: string[];
  action: () => void;
}

export interface CommandPaletteProps {
  commands?: CommandAction[];
  isOpen?: boolean;
  onClose?: () => void;
  placeholder?: string;
}

// Create CommandPalette wrapper for backward compatibility
export const CommandPalette: React.FC<
  CommandPaletteProps & {
    actions?: CommandAction[];
    recentActions?: any;
    onRecentAction?: any;
  }
> = ({ isOpen = false, onClose = () => {} }) => (
  <CommandDialog open={isOpen} onOpenChange={onClose}>
    <CommandInput placeholder='Type a command or search...' />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading='Suggestions'>
        <CommandItem>Calendar</CommandItem>
        <CommandItem>Search Emoji</CommandItem>
        <CommandItem>Calculator</CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
);
export const useCommandPalette = () => {
  // Simple implementation for backward compatibility
  return {
    isOpen: false,
    toggle: () => {},
    open: () => {},
    close: () => {},
    recentActions: [],
    handleRecentAction: () => {},
  };
};

// Re-export default commands for backward compatibility
import { Search, FileText, User, Hash, Settings, LogOut } from 'lucide-react';

export const defaultCommands: CommandAction[] = [
  {
    id: 'search',
    label: 'Universal Search',
    description: 'Search customers, tickets, and transactions',
    icon: Search,
    section: 'Search',
    shortcut: 'Ctrl+F',
    keywords: ['find', 'lookup', 'search'],
    action: () => {
      /* Navigate to search */
    },
  },
  {
    id: 'renew',
    label: 'Renew Ticket',
    description: 'Process ticket renewal payment',
    icon: FileText,
    section: 'Transactions',
    shortcut: 'Ctrl+R',
    keywords: ['renew', 'renewal', 'extend'],
    action: () => {
      /* Navigate to renewal */
    },
  },
  {
    id: 'redeem',
    label: 'Redeem Ticket',
    description: 'Process ticket redemption',
    icon: FileText,
    section: 'Transactions',
    shortcut: 'Ctrl+D',
    keywords: ['redeem', 'redemption', 'collect'],
    action: () => {
      /* Navigate to redemption */
    },
  },
  {
    id: 'customer',
    label: 'Customer Enquiry',
    description: 'Look up customer information',
    icon: User,
    section: 'Search',
    shortcut: 'Ctrl+U',
    keywords: ['customer', 'client', 'enquiry'],
    action: () => {
      /* Navigate to customer enquiry */
    },
  },
  {
    id: 'lost',
    label: 'Lost Pledge Report',
    description: 'Report lost pledge items',
    icon: Hash,
    section: 'Reports',
    keywords: ['lost', 'pledge', 'report'],
    action: () => {
      /* Navigate to lost pledge */
    },
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Application settings and preferences',
    icon: Settings,
    section: 'System',
    shortcut: 'Ctrl+,',
    keywords: ['settings', 'preferences', 'config'],
    action: () => {
      /* Navigate to settings */
    },
  },
  {
    id: 'logout',
    label: 'Logout',
    description: 'Sign out of the application',
    icon: LogOut,
    section: 'System',
    shortcut: 'Ctrl+Shift+L',
    keywords: ['logout', 'signout', 'exit'],
    action: () => {
      /* Handle logout */
    },
  },
];
