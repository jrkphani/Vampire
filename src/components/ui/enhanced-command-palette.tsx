import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DialogProps } from '@radix-ui/react-dialog';
import {
  Search,
  Clock,
  Hash,
  User,
  Package,
  CreditCard,
  ArrowRight,
  Phone,
  Calendar,
  DollarSign,
  Eye,
  RotateCcw,
  FileText,
  AlertCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { Badge } from './badge';
import { Button } from './button';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from './command';
import type {
  SearchResult,
  SearchQuery,
  SearchResponse,
  CustomerSearchResult,
  TicketSearchResult,
  TransactionSearchResult,
  CommandSearchResult,
  RecentSearchResult,
} from '@/types/search';
import type { Customer, TicketData, Transaction } from '@/types/business';

// Enhanced Command Palette Props
export interface EnhancedCommandPaletteProps extends DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: SearchQuery) => Promise<SearchResponse>;
  onResultSelect: (result: SearchResult) => void;
  placeholder?: string;
  maxResults?: number;
  enableFuzzySearch?: boolean;
  enableRecentSearch?: boolean;
  className?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to get expiry status
const getExpiryStatus = (
  expiryDate: string
): 'active' | 'expiring' | 'expired' => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 7) return 'expiring';
  return 'active';
};

// Helper function to detect search type
const detectSearchType = (
  term: string
): 'nric' | 'ticket' | 'phone' | 'general' => {
  // NRIC pattern (S/T/F/G followed by 7 digits and letter)
  if (/^[STFG]\d{7}[A-Z]$/i.test(term)) return 'nric';

  // Ticket pattern (Letter/MMYY/XXXX)
  if (/^[A-Z]\/\d{4}\/\d{4}$/i.test(term)) return 'ticket';

  // Phone pattern (+65 followed by 8 digits)
  if (/^(\+65\s?)?\d{8}$/i.test(term)) return 'phone';

  return 'general';
};

// Result Item Components
const CommandResultItem: React.FC<{
  result: CommandSearchResult;
  onSelect: () => void;
}> = ({ result, onSelect }) => {
  const Icon = result.icon;

  return (
    <CommandItem
      value={`${result.title} ${result.description} ${result.keywords?.join(' ') || ''}`}
      onSelect={onSelect}
      className='flex items-center gap-3 px-3 py-2'
    >
      <Icon className='h-4 w-4 shrink-0 text-info' />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='font-medium truncate'>{result.title}</span>
          {result.recent && <Clock className='h-3 w-3 shrink-0 opacity-60' />}
          {result.badge && (
            <Badge variant='secondary' className='text-xs'>
              {result.badge}
            </Badge>
          )}
        </div>
        {result.description && (
          <p className='text-xs text-muted-foreground truncate'>
            {result.description}
          </p>
        )}
      </div>
      {result.shortcut && <CommandShortcut>{result.shortcut}</CommandShortcut>}
    </CommandItem>
  );
};

const CustomerResultItem: React.FC<{
  result: CustomerSearchResult;
  onSelect: () => void;
}> = ({ result, onSelect }) => {
  const customer = result.data;

  return (
    <CommandItem
      value={`${result.title} ${customer.nric} ${customer.contact} ${customer.address}`}
      onSelect={onSelect}
      className='flex items-center gap-3 px-3 py-2'
    >
      <User className='h-4 w-4 shrink-0 text-success' />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='font-medium truncate'>{customer.name}</span>
          <Badge variant='outline' className='text-xs'>
            Customer
          </Badge>
          {result.recent && <Clock className='h-3 w-3 shrink-0 opacity-60' />}
        </div>
        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Hash className='h-3 w-3' />
            {customer.nric}
          </span>
          <span className='flex items-center gap-1'>
            <Phone className='h-3 w-3' />
            {customer.contact}
          </span>
          {result.activeTickets && (
            <span className='flex items-center gap-1'>
              <Package className='h-3 w-3' />
              {result.activeTickets} tickets
            </span>
          )}
        </div>
      </div>
      <div className='flex items-center gap-1'>
        <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
          <Eye className='h-3 w-3' />
        </Button>
        <ArrowRight className='h-3 w-3 text-muted-foreground' />
      </div>
    </CommandItem>
  );
};

const TicketResultItem: React.FC<{
  result: TicketSearchResult;
  onSelect: () => void;
}> = ({ result, onSelect }) => {
  const ticket = result.data;
  const expiryStatus = getExpiryStatus(ticket.dates.expiryDate);

  const statusColors = {
    active: 'text-success',
    expiring: 'text-warning',
    expired: 'text-error',
  };

  return (
    <CommandItem
      value={`${result.title} ${ticket.customer.name} ${ticket.customer.nric} ${ticket.pledge.description}`}
      onSelect={onSelect}
      className='flex items-center gap-3 px-3 py-2'
    >
      <Package className={cn('h-4 w-4 shrink-0', statusColors[expiryStatus])} />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='font-medium truncate'>{ticket.ticketNo}</span>
          <Badge
            variant={
              expiryStatus === 'expired'
                ? 'destructive'
                : expiryStatus === 'expiring'
                  ? 'secondary'
                  : 'default'
            }
            className='text-xs'
          >
            {ticket.status}
          </Badge>
          {result.recent && <Clock className='h-3 w-3 shrink-0 opacity-60' />}
        </div>
        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <User className='h-3 w-3' />
            {ticket.customer.name}
          </span>
          <span className='flex items-center gap-1'>
            <DollarSign className='h-3 w-3' />
            {formatCurrency(ticket.financial.principal)}
          </span>
          <span className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            Expires {formatDate(ticket.dates.expiryDate)}
          </span>
        </div>
        <p className='text-xs text-muted-foreground truncate mt-1'>
          {ticket.pledge.description}
        </p>
      </div>
      <div className='flex items-center gap-1'>
        <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
          <RotateCcw className='h-3 w-3' />
        </Button>
        <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
          <FileText className='h-3 w-3' />
        </Button>
        <ArrowRight className='h-3 w-3 text-muted-foreground' />
      </div>
    </CommandItem>
  );
};

const TransactionResultItem: React.FC<{
  result: TransactionSearchResult;
  onSelect: () => void;
}> = ({ result, onSelect }) => {
  const transaction = result.data;

  return (
    <CommandItem
      value={`${result.title} ${transaction.ticketNo} ${result.customerName || ''}`}
      onSelect={onSelect}
      className='flex items-center gap-3 px-3 py-2'
    >
      <CreditCard className='h-4 w-4 shrink-0 text-accent' />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='font-medium truncate'>
            {transaction.type.toUpperCase()}
          </span>
          <Badge variant='outline' className='text-xs'>
            {transaction.status}
          </Badge>
          {result.recent && <Clock className='h-3 w-3 shrink-0 opacity-60' />}
        </div>
        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Package className='h-3 w-3' />
            {transaction.ticketNo}
          </span>
          {result.customerName && (
            <span className='flex items-center gap-1'>
              <User className='h-3 w-3' />
              {result.customerName}
            </span>
          )}
          <span className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            {formatDate(transaction.transactionDate)}
          </span>
          {result.amount && (
            <span className='flex items-center gap-1'>
              <DollarSign className='h-3 w-3' />
              {formatCurrency(result.amount)}
            </span>
          )}
        </div>
      </div>
      <div className='flex items-center gap-1'>
        <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
          <Eye className='h-3 w-3' />
        </Button>
        <ArrowRight className='h-3 w-3 text-muted-foreground' />
      </div>
    </CommandItem>
  );
};

// Main Enhanced Command Palette Component
export function EnhancedCommandPalette({
  isOpen,
  onClose,
  onSearch,
  onResultSelect,
  placeholder = 'Search commands, customers, tickets...',
  maxResults = 20,
  enableFuzzySearch = true,
  enableRecentSearch = true,
  className,
  ...props
}: EnhancedCommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [detectedType, setDetectedType] = useState<string>('general');

  // Debounced search
  const handleSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setResults([]);
        setSearchTime(0);
        setDetectedType('general');
        return;
      }

      setIsLoading(true);
      const startTime = performance.now();

      try {
        const searchType = detectSearchType(term);
        setDetectedType(searchType);

        const query: SearchQuery = {
          term: term.trim(),
          limit: maxResults,
          includeCommands: true,
          includeRecent: enableRecentSearch,
        };

        const response = await onSearch(query);
        setResults(response.results);
        setSearchTime(performance.now() - startTime);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSearch, maxResults, enableRecentSearch]
  );

  // Debounce search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(search);
    }, 150);

    return () => clearTimeout(debounceTimer);
  }, [search, handleSearch]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};

    results.forEach(result => {
      const groupKey =
        result.category === 'recent'
          ? 'Recent'
          : result.category === 'commands'
            ? 'Commands'
            : result.category === 'customers'
              ? 'Customers'
              : result.category === 'tickets'
                ? 'Tickets'
                : result.category === 'transactions'
                  ? 'Transactions'
                  : 'Other';

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(result);
    });

    return groups;
  }, [results]);

  // Handle result selection
  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      onResultSelect(result);
      onClose();
    },
    [onResultSelect, onClose]
  );

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setResults([]);
      setSearchTime(0);
      setDetectedType('general');
    }
  }, [isOpen]);

  // Note: Global keyboard shortcut is handled by GlobalShortcuts.tsx
  // Removed backup Cmd+K handler to prevent conflicts

  // Get search type description
  const getSearchTypeDescription = (type: string) => {
    switch (type) {
      case 'nric':
        return 'NRIC/Passport detected';
      case 'ticket':
        return 'Ticket number detected';
      case 'phone':
        return 'Phone number detected';
      default:
        return 'General search';
    }
  };

  // Render result item based on category to ensure proper type discrimination
  const renderResultItem = (result: SearchResult) => {
    switch (result.category) {
      case 'commands':
        return (
          <CommandResultItem
            key={result.id}
            result={result as CommandSearchResult}
            onSelect={() => handleResultSelect(result)}
          />
        );
      case 'customers':
        return (
          <CustomerResultItem
            key={result.id}
            result={result as CustomerSearchResult}
            onSelect={() => handleResultSelect(result)}
          />
        );
      case 'tickets':
        return (
          <TicketResultItem
            key={result.id}
            result={result as TicketSearchResult}
            onSelect={() => handleResultSelect(result)}
          />
        );
      case 'transactions':
        return (
          <TransactionResultItem
            key={result.id}
            result={result as TransactionSearchResult}
            onSelect={() => handleResultSelect(result)}
          />
        );
      case 'recent':
        // Handle recent items by transforming to their original type structure
        const recentResult = result as RecentSearchResult;
        switch (result.type) {
          case 'customer':
            const customerResult: CustomerSearchResult = {
              id: recentResult.id,
              type: 'customer',
              category: 'customers',
              title: recentResult.title,
              description: recentResult.description,
              ...(recentResult.subtitle && { subtitle: recentResult.subtitle }),
              icon: recentResult.icon,
              ...(recentResult.badge && { badge: recentResult.badge }),
              data: recentResult.originalData as Customer,
              ...(recentResult.metadata && { metadata: recentResult.metadata }),
              ...(recentResult.recent !== undefined && {
                recent: recentResult.recent,
              }),
              ...(recentResult.relevanceScore !== undefined && {
                relevanceScore: recentResult.relevanceScore,
              }),
            };
            return (
              <CustomerResultItem
                key={result.id}
                result={customerResult}
                onSelect={() => handleResultSelect(result)}
              />
            );
          case 'ticket':
            const ticketResult: TicketSearchResult = {
              id: recentResult.id,
              type: 'ticket',
              category: 'tickets',
              title: recentResult.title,
              description: recentResult.description,
              ...(recentResult.subtitle && { subtitle: recentResult.subtitle }),
              icon: recentResult.icon,
              ...(recentResult.badge && { badge: recentResult.badge }),
              data: recentResult.originalData as TicketData,
              ...(recentResult.metadata && { metadata: recentResult.metadata }),
              ...(recentResult.recent !== undefined && {
                recent: recentResult.recent,
              }),
              ...(recentResult.relevanceScore !== undefined && {
                relevanceScore: recentResult.relevanceScore,
              }),
            };
            return (
              <TicketResultItem
                key={result.id}
                result={ticketResult}
                onSelect={() => handleResultSelect(result)}
              />
            );
          case 'transaction':
            const transactionResult: TransactionSearchResult = {
              id: recentResult.id,
              type: 'transaction',
              category: 'transactions',
              title: recentResult.title,
              description: recentResult.description,
              ...(recentResult.subtitle && { subtitle: recentResult.subtitle }),
              icon: recentResult.icon,
              ...(recentResult.badge && { badge: recentResult.badge }),
              data: recentResult.originalData as Transaction,
              ...(recentResult.metadata && { metadata: recentResult.metadata }),
              ...(recentResult.recent !== undefined && {
                recent: recentResult.recent,
              }),
              ...(recentResult.relevanceScore !== undefined && {
                relevanceScore: recentResult.relevanceScore,
              }),
            };
            return (
              <TransactionResultItem
                key={result.id}
                result={transactionResult}
                onSelect={() => handleResultSelect(result)}
              />
            );
          default:
            return null;
        }
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} {...props}>
      <DialogContent className='overflow-hidden p-0 shadow-lg max-w-4xl max-h-[60vh]'>
        <DialogTitle className='sr-only'>Command Palette</DialogTitle>
        <DialogDescription className='sr-only'>
          Search commands, customers, tickets, and transactions
        </DialogDescription>
        <Command className={cn('h-full', className)}>
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
          />

          {/* Search Info Bar */}
          {search && (
            <div className='px-4 py-2 border-b bg-muted/30 text-xs text-muted-foreground'>
              <div className='flex items-center justify-between'>
                <span>
                  {getSearchTypeDescription(detectedType)} • {results.length}{' '}
                  results
                  {searchTime > 0 && ` • ${Math.round(searchTime)}ms`}
                </span>
                {isLoading && <span>Searching...</span>}
              </div>
            </div>
          )}

          <CommandList>
            <CommandEmpty>
              <div className='flex flex-col items-center gap-3 py-8 text-center'>
                {search ? (
                  <>
                    <AlertCircle className='h-8 w-8 opacity-50' />
                    <div>
                      <p className='font-medium'>No results found</p>
                      <p className='text-sm text-muted-foreground'>
                        Try a different search term or check the spelling
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Search className='h-8 w-8 opacity-50' />
                    <div>
                      <p className='font-medium'>Start typing to search</p>
                      <p className='text-sm text-muted-foreground'>
                        Search commands, customers, tickets, or transactions
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CommandEmpty>

            {Object.entries(groupedResults).map(([group, groupResults]) => (
              <CommandGroup key={group} heading={group}>
                {groupResults.map(renderResultItem)}
              </CommandGroup>
            ))}
          </CommandList>

          {/* Footer */}
          <div className='border-t bg-muted/50 px-4 py-3 text-xs text-muted-foreground'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <span className='flex items-center gap-1'>
                  <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100'>
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span className='flex items-center gap-1'>
                  <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100'>
                    ↵
                  </kbd>
                  Select
                </span>
                <span className='flex items-center gap-1'>
                  <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100'>
                    esc
                  </kbd>
                  Close
                </span>
              </div>
              <div className='text-right'>
                <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100'>
                  Ctrl+K
                </kbd>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
