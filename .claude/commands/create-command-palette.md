# Command Palette Development

Implement comprehensive command palette functionality: $ARGUMENTS

## Core Architecture

### Command System Foundation
```typescript
interface Command {
  id: string
  name: string
  description?: string
  shortcut?: string[]
  icon?: string
  category: CommandCategory
  action: (args?: any) => void | Promise<void>
  condition?: () => boolean
  searchTerms?: string[]
}

type CommandCategory = 
  | 'navigation' 
  | 'transactions' 
  | 'search' 
  | 'quick-actions' 
  | 'system' 
  | 'help'

interface CommandPaletteState {
  isOpen: boolean
  query: string
  selectedIndex: number
  commands: Command[]
  recentCommands: Command[]
  categories: CommandCategory[]
}
```

### shadcn/ui Command Component Setup
```bash
# Install required shadcn/ui components
npx shadcn-ui@latest add command
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add kbd
npx shadcn-ui@latest add separator
```

## Implementation Components

### Main Command Palette Component
```typescript
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface CommandPaletteProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onOpenChange }) => {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const { commands, recentCommands } = useCommands()
  const filteredCommands = useFilteredCommands(commands, query)
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onOpenChange(!isOpen)
    }
  }, [isOpen, onOpenChange])
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search commands, customers, tickets..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {query === '' && recentCommands.length > 0 && (
          <CommandGroup heading="Recent">
            {recentCommands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => executeCommand(command)}
                className="flex items-center gap-2"
              >
                {command.icon && <span className="w-4 h-4">{command.icon}</span>}
                <span>{command.name}</span>
                {command.shortcut && (
                  <kbd className="ml-auto text-xs">{command.shortcut.join(' ')}</kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {Object.entries(groupCommandsByCategory(filteredCommands)).map(([category, commands]) => (
          <CommandGroup key={category} heading={category}>
            {commands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => executeCommand(command)}
                className="flex items-center gap-2"
              >
                {command.icon && <span className="w-4 h-4">{command.icon}</span>}
                <div className="flex-1">
                  <div className="font-medium">{command.name}</div>
                  {command.description && (
                    <div className="text-sm text-muted-foreground">{command.description}</div>
                  )}
                </div>
                {command.shortcut && (
                  <kbd className="text-xs">{command.shortcut.join(' ')}</kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
```

### Command Registration System
```typescript
// Global command registry
const useCommandRegistry = create<{
  commands: Command[]
  registerCommand: (command: Command) => void
  unregisterCommand: (id: string) => void
  executeCommand: (command: Command) => void
  recentCommands: Command[]
  addToRecent: (command: Command) => void
}>((set, get) => ({
  commands: [],
  recentCommands: [],
  
  registerCommand: (command) => set(state => ({
    commands: [...state.commands.filter(c => c.id !== command.id), command]
  })),
  
  unregisterCommand: (id) => set(state => ({
    commands: state.commands.filter(c => c.id !== id)
  })),
  
  executeCommand: (command) => {
    get().addToRecent(command)
    command.action()
  },
  
  addToRecent: (command) => set(state => ({
    recentCommands: [
      command,
      ...state.recentCommands.filter(c => c.id !== command.id)
    ].slice(0, 5)
  }))
}))

// Hook for registering commands
const useRegisterCommands = (commands: Command[]) => {
  const { registerCommand, unregisterCommand } = useCommandRegistry()
  
  useEffect(() => {
    commands.forEach(registerCommand)
    return () => commands.forEach(cmd => unregisterCommand(cmd.id))
  }, [commands, registerCommand, unregisterCommand])
}
```

## Core Command Definitions

### Navigation Commands
```typescript
const navigationCommands: Command[] = [
  {
    id: 'nav-dashboard',
    name: 'Go to Dashboard',
    shortcut: ['g', 'd'],
    icon: '📊',
    category: 'navigation',
    action: () => router.push('/dashboard'),
    searchTerms: ['dashboard', 'home', 'main']
  },
  {
    id: 'nav-renew',
    name: 'Go to Renewals',
    shortcut: ['g', 'r'],
    icon: '🔄',
    category: 'navigation',
    action: () => router.push('/renew'),
    searchTerms: ['renew', 'renewal', 'extend']
  },
  {
    id: 'nav-redeem',
    name: 'Go to Redemptions',
    shortcut: ['g', 'e'],
    icon: '✅',
    category: 'navigation', 
    action: () => router.push('/redeem'),
    searchTerms: ['redeem', 'redemption', 'collect']
  },
  {
    id: 'nav-enquiry',
    name: 'Go to Enquiry',
    shortcut: ['g', 's'],
    icon: '🔍',
    category: 'navigation',
    action: () => router.push('/enquiry'),
    searchTerms: ['search', 'enquiry', 'find', 'lookup']
  }
]
```

### Transaction Commands
```typescript
const transactionCommands: Command[] = [
  {
    id: 'quick-renew',
    name: 'Quick Renewal',
    description: 'Renew ticket by number',
    shortcut: ['q', 'r'],
    icon: '⚡',
    category: 'quick-actions',
    action: async () => {
      const ticketNumber = await promptForInput('Enter ticket number:')
      if (ticketNumber) {
        router.push(`/renew?ticket=${ticketNumber}`)
      }
    },
    searchTerms: ['quick', 'renew', 'fast']
  },
  {
    id: 'quick-redeem', 
    name: 'Quick Redemption',
    description: 'Redeem ticket by number',
    shortcut: ['q', 'e'],
    icon: '⚡',
    category: 'quick-actions',
    action: async () => {
      const ticketNumber = await promptForInput('Enter ticket number:')
      if (ticketNumber) {
        router.push(`/redeem?ticket=${ticketNumber}`)
      }
    }
  },
  {
    id: 'find-customer',
    name: 'Find Customer',
    description: 'Search by name or NRIC',
    shortcut: ['f', 'c'],
    icon: '👤',
    category: 'search',
    action: async () => {
      const query = await promptForInput('Enter customer name or NRIC:')
      if (query) {
        router.push(`/enquiry?customer=${query}`)
      }
    }
  }
]
```

### System Commands
```typescript
const systemCommands: Command[] = [
  {
    id: 'refresh-data',
    name: 'Refresh Data',
    description: 'Reload current page data',
    shortcut: ['⌘', 'r'],
    icon: '🔄',
    category: 'system',
    action: () => {
      queryClient.invalidateQueries()
      toast.success('Data refreshed')
    }
  },
  {
    id: 'toggle-theme',
    name: 'Toggle Theme',
    description: 'Switch between light and dark mode',
    shortcut: ['⌘', 't'],
    icon: '🌙',
    category: 'system',
    action: () => {
      const { theme, setTheme } = useTheme()
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  },
  {
    id: 'show-shortcuts',
    name: 'Show Keyboard Shortcuts',
    description: 'Display all available shortcuts',
    shortcut: ['?'],
    icon: '⌨️',
    category: 'help',
    action: () => setShortcutsModalOpen(true)
  }
]
```

## Advanced Search Features

### Universal Search Integration
```typescript
const useUniversalSearch = (query: string) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    
    const results = await Promise.all([
      searchCustomers(searchQuery),
      searchTickets(searchQuery),
      searchCommands(searchQuery)
    ])
    
    setSearchResults(results.flat())
  }, 200)
  
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])
  
  return searchResults
}

// Smart search result conversion to commands
const convertSearchResultToCommand = (result: SearchResult): Command => {
  switch (result.type) {
    case 'customer':
      return {
        id: `customer-${result.id}`,
        name: result.name,
        description: `Customer: ${result.nric}`,
        icon: '👤',
        category: 'search',
        action: () => router.push(`/customer/${result.id}`)
      }
    
    case 'ticket':
      return {
        id: `ticket-${result.id}`,
        name: result.ticketNumber,
        description: `${result.customer.name} - $${result.amount}`,
        icon: '🎫',
        category: 'search',
        action: () => router.push(`/ticket/${result.id}`)
      }
  }
}
```

### Fuzzy Search Implementation
```typescript
import Fuse from 'fuse.js'

const useFuzzySearch = (items: Command[], query: string) => {
  const fuse = useMemo(() => new Fuse(items, {
    keys: ['name', 'description', 'searchTerms'],
    threshold: 0.3,
    includeScore: true
  }), [items])
  
  return useMemo(() => {
    if (!query) return items
    return fuse.search(query).map(result => result.item)
  }, [fuse, query, items])
}
```

## Performance Optimization

### Command Palette Performance
```typescript
// Virtualization for large command lists
import { FixedSizeList as List } from 'react-window'

const VirtualizedCommandList = ({ commands, onSelect }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CommandItem
        key={commands[index].id}
        onSelect={() => onSelect(commands[index])}
      >
        {commands[index].name}
      </CommandItem>
    </div>
  )
  
  return (
    <List
      height={300}
      itemCount={commands.length}
      itemSize={48}
      itemData={commands}
    >
      {Row}
    </List>
  )
}

// Memoized command filtering
const useFilteredCommands = (commands: Command[], query: string) => {
  return useMemo(() => {
    if (!query) return commands
    
    return commands.filter(command => {
      const searchText = [
        command.name,
        command.description,
        ...(command.searchTerms || [])
      ].join(' ').toLowerCase()
      
      return searchText.includes(query.toLowerCase())
    })
  }, [commands, query])
}
```

## Testing Command Palette

### Component Testing
```typescript
describe('CommandPalette', () => {
  it('opens with Ctrl+K shortcut', async () => {
    const user = userEvent.setup()
    render(<CommandPalette />)
    
    await user.keyboard('{Control>}k{/Control}')
    
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByPlaceholderText(/search commands/i)).toHaveFocus()
  })
  
  it('filters commands based on search query', async () => {
    const user = userEvent.setup()
    render(<CommandPalette isOpen={true} />)
    
    await user.type(screen.getByRole('combobox'), 'renew')
    
    expect(screen.getByText('Quick Renewal')).toBeVisible()
    expect(screen.queryByText('Find Customer')).not.toBeInTheDocument()
  })
  
  it('executes commands on selection', async () => {
    const mockAction = jest.fn()
    const testCommand = { id: 'test', name: 'Test Command', action: mockAction }
    
    render(<CommandPalette isOpen={true} commands={[testCommand]} />)
    
    await user.click(screen.getByText('Test Command'))
    
    expect(mockAction).toHaveBeenCalled()
  })
})
```

### Integration Testing
```typescript
it('integrates with business transactions', async () => {
  render(<App />)
  
  // Open command palette
  await user.keyboard('{Control>}k{/Control}')
  
  // Search for renewal
  await user.type(screen.getByRole('combobox'), 'quick renew')
  await user.click(screen.getByText('Quick Renewal'))
  
  // Should navigate to renewal page
  expect(window.location.pathname).toBe('/renew')
})
```

## Accessibility Features

### Keyboard Navigation
```typescript
const useCommandPaletteKeyboard = (commands: Command[], selectedIndex: number, setSelectedIndex: (index: number) => void) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(Math.min(selectedIndex + 1, commands.length - 1))
        break
      
      case 'ArrowUp':
        e.preventDefault() 
        setSelectedIndex(Math.max(selectedIndex - 1, 0))
        break
      
      case 'Enter':
        e.preventDefault()
        if (commands[selectedIndex]) {
          executeCommand(commands[selectedIndex])
        }
        break
      
      case 'Escape':
        e.preventDefault()
        closeCommandPalette()
        break
    }
  }
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, commands])
}
```

## Implementation Checklist
- [ ] shadcn/ui Command components installed and configured
- [ ] Command registration system implemented
- [ ] Universal search with fuzzy matching
- [ ] Keyboard shortcuts (Ctrl+K, arrow navigation, Enter, Escape)
- [ ] Performance optimization (virtualization, memoization)
- [ ] Accessibility compliance (ARIA labels, keyboard navigation)
- [ ] Business-specific commands (transactions, search, navigation)
- [ ] Recent commands tracking
- [ ] Category grouping and filtering
- [ ] Comprehensive testing (unit, integration, accessibility)

Usage: `/create-command-palette`
Usage: `/add-command [command-definition]`
Usage: `/test-command-palette --accessibility`
