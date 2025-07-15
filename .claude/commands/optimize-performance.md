# Performance Optimization Command

Optimize ValueMax Vampire Frontend for production performance: $ARGUMENTS

## Performance Targets
- **Initial Page Load**: < 2 seconds
- **Keyboard Response**: < 100ms (Enter, Tab, Escape)
- **Search Operations**: < 500ms (customer/ticket lookup)
- **Form Submissions**: < 1 second (transaction processing)
- **Command Palette**: < 50ms (search response time)

## Bundle Optimization

### Vite Build Configuration
```typescript
// vite.config.ts optimization
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'vendor-ui': ['@radix-ui/react-slot', '@radix-ui/react-dialog'],
          'vendor-utils': ['date-fns', 'numeral', 'clsx'],
          'vendor-query': ['@tanstack/react-query'],
          
          // Business logic chunks
          'business-transactions': ['./src/components/business', './src/stores'],
          'business-forms': ['./src/components/forms'],
          'ui-components': ['./src/components/ui']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### Code Splitting Strategy
```typescript
// Lazy load heavy components
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const RenewalForm = lazy(() => import('@/pages/Renewals'))
const RedemptionForm = lazy(() => import('@/pages/Redemptions'))
const EnquiryPage = lazy(() => import('@/pages/Enquiry'))

// Route-based code splitting
const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/dashboard" element={
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      } />
      <Route path="/renew" element={
        <Suspense fallback={<FormSkeleton />}>
          <RenewalForm />
        </Suspense>
      } />
    </Routes>
  </Router>
)

// Component-level lazy loading
const HeavyDataTable = lazy(() => 
  import('@/components/ui/DataTable').then(module => ({
    default: module.DataTable
  }))
)
```

## React Performance Optimization

### Memoization Strategies
```typescript
// Memoize expensive calculations
const TransactionSummary = memo(({ transactions }: { transactions: Transaction[] }) => {
  const summary = useMemo(() => {
    return transactions.reduce((acc, transaction) => ({
      total: acc.total + transaction.amount,
      count: acc.count + 1,
      byStatus: {
        ...acc.byStatus,
        [transaction.status]: (acc.byStatus[transaction.status] || 0) + 1
      }
    }), { total: 0, count: 0, byStatus: {} })
  }, [transactions])
  
  return <SummaryDisplay summary={summary} />
})

// Memoize callback functions
const TicketLookup = ({ onTicketFound }: { onTicketFound: (ticket: Ticket) => void }) => {
  const handleSearch = useCallback(async (ticketNumber: string) => {
    const ticket = await searchTicket(ticketNumber)
    onTicketFound(ticket)
  }, [onTicketFound])
  
  const debouncedSearch = useDebouncedCallback(handleSearch, 300)
  
  return <SearchInput onSearch={debouncedSearch} />
}
```

### Efficient State Updates
```typescript
// Optimize Zustand state updates
const useTransactionStore = create<TransactionState>((set, get) => ({
  tickets: [],
  
  // Efficient array updates
  addTicket: (ticket) => set(state => ({
    tickets: state.tickets.concat(ticket)
  })),
  
  updateTicket: (id, updates) => set(state => ({
    tickets: state.tickets.map(ticket => 
      ticket.id === id ? { ...ticket, ...updates } : ticket
    )
  })),
  
  // Batch updates
  batchUpdateTickets: (updates) => set(state => ({
    tickets: state.tickets.map(ticket => {
      const update = updates[ticket.id]
      return update ? { ...ticket, ...update } : ticket
    })
  }))
}))
```

### Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList as List } from 'react-window'

const VirtualizedTransactionTable = ({ transactions }: { transactions: Transaction[] }) => {
  const Row = ({ index, style }: { index: number, style: CSSProperties }) => (
    <div style={style} className="flex items-center p-2 border-b">
      <TransactionRow transaction={transactions[index]} />
    </div>
  )
  
  return (
    <List
      height={400}
      itemCount={transactions.length}
      itemSize={50}
      itemData={transactions}
      className="border rounded-md"
    >
      {Row}
    </List>
  )
}
```

## Form Performance Optimization

### Optimized Form Handling
```typescript
// Debounced validation for real-time feedback
const useOptimizedForm = <T extends FieldValues>(schema: ZodSchema<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })
  
  // Debounce validation to reduce CPU usage
  const debouncedValidate = useDebouncedCallback(
    (name: keyof T, value: any) => {
      form.trigger(name)
    },
    200
  )
  
  const register = (name: keyof T, options?: RegisterOptions) => {
    const registration = form.register(name, options)
    
    return {
      ...registration,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        registration.onChange(e)
        debouncedValidate(name, e.target.value)
      }
    }
  }
  
  return { ...form, register }
}

// Optimized field-level validation
const TicketNumberInput = memo(({ value, onChange, error }: TicketInputProps) => {
  const [localValue, setLocalValue] = useState(value)
  
  // Debounce external onChange to reduce parent re-renders
  const debouncedOnChange = useDebouncedCallback(onChange, 300)
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    debouncedOnChange(e.target.value)
  }
  
  return (
    <Input
      value={localValue}
      onChange={handleChange}
      error={error}
      placeholder="B/MMYY/XXXX"
    />
  )
})
```

## API Performance Optimization

### Query Optimization with TanStack Query
```typescript
// Optimize API queries with proper caching
const useOptimizedTicketQuery = (ticketNumber: string) => {
  return useQuery({
    queryKey: ['ticket', ticketNumber],
    queryFn: () => fetchTicket(ticketNumber),
    enabled: !!ticketNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false
  })
}

// Prefetch common queries
const usePrefetchCommonData = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Prefetch user's recent transactions
    queryClient.prefetchQuery({
      queryKey: ['recent-transactions'],
      queryFn: fetchRecentTransactions,
      staleTime: 2 * 60 * 1000
    })
    
    // Prefetch staff info
    queryClient.prefetchQuery({
      queryKey: ['staff-info'],
      queryFn: fetchStaffInfo,
      staleTime: 30 * 60 * 1000
    })
  }, [queryClient])
}

// Infinite queries for large datasets
const useInfiniteTransactions = (filters: TransactionFilters) => {
  return useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: ({ pageParam = 0 }) => 
      fetchTransactions({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      transactions: data.pages.flatMap(page => page.transactions)
    })
  })
}
```

### Request Batching and Deduplication
```typescript
// Batch multiple API requests
const useBatchedRequests = () => {
  const [requestQueue, setRequestQueue] = useState<Array<() => Promise<any>>>([])
  
  const batchedFetch = useDebouncedCallback(async () => {
    if (requestQueue.length === 0) return
    
    const requests = [...requestQueue]
    setRequestQueue([])
    
    // Execute requests in parallel
    await Promise.allSettled(requests.map(request => request()))
  }, 50)
  
  const addToBatch = (request: () => Promise<any>) => {
    setRequestQueue(prev => [...prev, request])
    batchedFetch()
  }
  
  return addToBatch
}

// Deduplicate identical requests
const requestCache = new Map<string, Promise<any>>()

const deduplicatedFetch = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  if (requestCache.has(key)) {
    return requestCache.get(key)!
  }
  
  const promise = fetcher().finally(() => {
    requestCache.delete(key)
  })
  
  requestCache.set(key, promise)
  return promise
}
```

## Search Performance Optimization

### Optimized Search Implementation
```typescript
// Efficient search with indexing
class SearchIndex {
  private index: Map<string, Set<string>> = new Map()
  
  addDocument(id: string, content: string) {
    const words = content.toLowerCase().split(/\s+/)
    words.forEach(word => {
      if (!this.index.has(word)) {
        this.index.set(word, new Set())
      }
      this.index.get(word)!.add(id)
    })
  }
  
  search(query: string): string[] {
    const words = query.toLowerCase().split(/\s+/)
    if (words.length === 0) return []
    
    let results = this.index.get(words[0]) || new Set()
    
    for (let i = 1; i < words.length; i++) {
      const wordResults = this.index.get(words[i]) || new Set()
      results = new Set([...results].filter(id => wordResults.has(id)))
    }
    
    return Array.from(results)
  }
}

// Optimized command palette search
const useOptimizedCommandSearch = (commands: Command[], query: string) => {
  const searchIndex = useMemo(() => {
    const index = new SearchIndex()
    commands.forEach(command => {
      const searchText = [
        command.name,
        command.description || '',
        ...(command.searchTerms || [])
      ].join(' ')
      index.addDocument(command.id, searchText)
    })
    return index
  }, [commands])
  
  const results = useMemo(() => {
    if (!query) return commands
    
    const matchingIds = searchIndex.search(query)
    return commands.filter(command => matchingIds.includes(command.id))
  }, [commands, query, searchIndex])
  
  return results
}
```

## Memory Management

### Memory Leak Prevention
```typescript
// Cleanup subscriptions and timers
const useCleanupSubscriptions = () => {
  const subscriptions = useRef<Array<() => void>>([])
  
  const addSubscription = (cleanup: () => void) => {
    subscriptions.current.push(cleanup)
  }
  
  useEffect(() => {
    return () => {
      subscriptions.current.forEach(cleanup => cleanup())
      subscriptions.current = []
    }
  }, [])
  
  return addSubscription
}

// Weak references for caches
const createWeakCache = <K extends object, V>() => {
  const cache = new WeakMap<K, V>()
  
  return {
    get: (key: K) => cache.get(key),
    set: (key: K, value: V) => cache.set(key, value),
    has: (key: K) => cache.has(key)
  }
}

// Automatic cache cleanup
const useLRUCache = <K, V>(maxSize: number) => {
  const cache = useRef(new Map<K, { value: V, timestamp: number }>())
  
  const get = useCallback((key: K): V | undefined => {
    const item = cache.current.get(key)
    if (item) {
      // Update timestamp for LRU
      item.timestamp = Date.now()
      return item.value
    }
    return undefined
  }, [])
  
  const set = useCallback((key: K, value: V) => {
    // Remove oldest items if cache is full
    if (cache.current.size >= maxSize) {
      const entries = Array.from(cache.current.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const itemsToRemove = entries.slice(0, entries.length - maxSize + 1)
      itemsToRemove.forEach(([key]) => cache.current.delete(key))
    }
    
    cache.current.set(key, { value, timestamp: Date.now() })
  }, [maxSize])
  
  return { get, set }
}
```

## CSS and Styling Performance

### Optimized CSS Strategy
```css
/* Use CSS containment for performance */
.transaction-card {
  contain: layout style;
}

.command-palette {
  contain: layout style paint;
}

/* Optimize animations with transform and opacity */
.modal-enter {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

.modal-enter-active {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* Use will-change sparingly and cleanup */
.animating-element {
  will-change: transform;
}

.animating-element.animation-complete {
  will-change: auto;
}
```

### Design Token Performance
```typescript
// Optimize design token usage
const useDesignTokens = () => {
  const tokens = useMemo(() => ({
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      success: 'var(--color-success)',
      error: 'var(--color-error)'
    },
    spacing: {
      xs: 'var(--space-1)',
      sm: 'var(--space-2)',
      md: 'var(--space-4)',
      lg: 'var(--space-6)',
      xl: 'var(--space-8)'
    }
  }), [])
  
  return tokens
}

// CSS-in-JS optimization
const optimizedStyles = {
  button: css`
    background: var(--color-primary);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    
    /* Use GPU acceleration for interactions */
    &:hover {
      transform: translateY(-1px);
      will-change: transform;
    }
    
    &:not(:hover) {
      will-change: auto;
    }
  `
}
```

## Performance Monitoring

### Real-time Performance Tracking
```typescript
// Performance metrics collection
const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  
  const measureOperation = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - start
      
      setMetrics(prev => ({
        ...prev,
        [name]: { duration, timestamp: Date.now(), success: true }
      }))
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      setMetrics(prev => ({
        ...prev,
        [name]: { duration, timestamp: Date.now(), success: false }
      }))
      
      throw error
    }
  }, [])
  
  return { metrics, measureOperation }
}

// Core Web Vitals monitoring
const useCoreWebVitals = () => {
  useEffect(() => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }, [])
}
```

### Performance Budget Enforcement
```typescript
// Performance budget validation
const PERFORMANCE_BUDGETS = {
  pageLoad: 2000,
  keyboardResponse: 100,
  searchResponse: 500,
  formSubmission: 1000,
  commandPalette: 50
}

const validatePerformanceBudget = (metric: string, duration: number) => {
  const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS]
  
  if (budget && duration > budget) {
    console.warn(`Performance budget exceeded for ${metric}: ${duration}ms > ${budget}ms`)
    
    // Report to monitoring service
    if (import.meta.env.PROD) {
      reportPerformanceIssue(metric, duration, budget)
    }
  }
}
```

## Bundle Analysis and Optimization

### Bundle Analysis Commands
```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for duplicate dependencies
npm ls --depth=0

# Identify heavy dependencies
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js
```

### Tree Shaking Optimization
```typescript
// Ensure proper tree shaking
export { Button } from './Button'
export { Input } from './Input'
export { Card } from './Card'

// Avoid default exports for better tree shaking
// ❌ Don't do this:
// export default { Button, Input, Card }

// ✅ Do this instead:
export * from './Button'
export * from './Input'
export * from './Card'
```

## Performance Checklist
- [ ] Bundle size optimized (< 1MB initial load)
- [ ] Code splitting implemented for routes and heavy components
- [ ] React.memo and useMemo applied to expensive components
- [ ] Form validation debounced appropriately
- [ ] API queries optimized with proper caching
- [ ] Search functionality indexed and optimized
- [ ] Memory leaks prevented with proper cleanup
- [ ] CSS performance optimized (containment, efficient animations)
- [ ] Performance metrics monitoring implemented
- [ ] Core Web Vitals tracking enabled
- [ ] Performance budgets enforced

Usage: `/optimize-performance [component-name]`
Usage: `/analyze-bundle --detailed`
Usage: `/monitor-performance --real-time`
