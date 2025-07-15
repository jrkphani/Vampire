import {
  SearchProvider,
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchHistoryItem,
  CustomerSearchResult,
  TicketSearchResult,
  TransactionSearchResult,
  CommandSearchResult,
  RecentSearchResult,
} from '@/types/search';
import {
  Customer,
  TicketData,
  Transaction,
  TicketStatus,
} from '@/types/business';
import {
  User,
  Package,
  CreditCard,
  Search,
  RotateCcw,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  Hash,
  Plus,
} from 'lucide-react';

// Mock data for customers
const mockCustomers: Customer[] = [
  {
    id: 'C001',
    nric: 'S1234567A',
    name: 'John Tan Wei Ming',
    dob: '1985-03-15',
    gender: 'M',
    nationality: 'Singapore',
    race: 'Chinese',
    address: '123 Orchard Road, #12-34',
    postalCode: '238858',
    contact: '+65 9123 4567',
    email: 'john.tan@email.com',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-10T14:30:00Z',
  },
  {
    id: 'C002',
    nric: 'S9876543B',
    name: 'Mary Lim Hui Fen',
    dob: '1990-08-22',
    gender: 'F',
    nationality: 'Singapore',
    race: 'Chinese',
    address: '456 Marina Bay, #08-10',
    postalCode: '018981',
    contact: '+65 8765 4321',
    email: 'mary.lim@email.com',
    createdAt: '2024-02-20T09:30:00Z',
    updatedAt: '2024-07-09T16:45:00Z',
  },
  {
    id: 'C003',
    nric: 'S5555666C',
    name: 'Ahmad bin Rahman',
    dob: '1978-12-10',
    gender: 'M',
    nationality: 'Singapore',
    race: 'Malay',
    address: '789 Bugis Street, #15-20',
    postalCode: '188021',
    contact: '+65 9876 5432',
    email: 'ahmad.rahman@email.com',
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-07-08T10:15:00Z',
  },
  {
    id: 'C004',
    nric: 'S7777888D',
    name: 'Priya Sharma',
    dob: '1992-05-18',
    gender: 'F',
    nationality: 'Singapore',
    race: 'Indian',
    address: '321 Little India, #05-15',
    postalCode: '208001',
    contact: '+65 8888 9999',
    email: 'priya.sharma@email.com',
    createdAt: '2024-04-05T14:20:00Z',
    updatedAt: '2024-07-07T09:30:00Z',
  },
];

// Mock data for tickets
const mockTickets: TicketData[] = [
  {
    ticketNo: 'B/0725/1234',
    pledgeNo: 'P123456',
    customerId: 'C001',
    customer: {
      id: 'C001',
      nric: 'S1234567A',
      name: 'John Tan Wei Ming',
      contact: '+65 9123 4567',
    },
    pledge: {
      pledgeNo: 'P123456',
      weight: '18.5g',
      description: '18K Gold Chain with diamond pendant',
      scrambledNo: 'SC789',
      pledgeCode: 'GC001',
      stCode: 'ST001',
      pCode: 'P001',
    },
    financial: {
      principal: 1200.0,
      interest: 36.0,
      months: 3,
      newAmount: 1236.0,
      outstandings: 0,
      interestRate: 1.5,
    },
    dates: {
      pawnDate: '2024-04-25',
      expiryDate: '2024-07-25',
      renewalDate: '2024-07-10',
    },
    status: TicketStatus.U,
    createdAt: '2024-04-25T10:00:00Z',
    updatedAt: '2024-07-10T14:30:00Z',
  },
  {
    ticketNo: 'S/0625/5678',
    pledgeNo: 'P789012',
    customerId: 'C002',
    customer: {
      id: 'C002',
      nric: 'S9876543B',
      name: 'Mary Lim Hui Fen',
      contact: '+65 8765 4321',
    },
    pledge: {
      pledgeNo: 'P789012',
      weight: '22.3g',
      description: '22K Gold Bracelet with precious stones',
      scrambledNo: 'SC456',
      pledgeCode: 'GB002',
      stCode: 'ST002',
      pCode: 'P002',
    },
    financial: {
      principal: 2500.0,
      interest: 112.5,
      months: 4,
      newAmount: 2612.5,
      outstandings: 0,
      interestRate: 1.5,
    },
    dates: {
      pawnDate: '2024-02-25',
      expiryDate: '2024-05-25',
      renewalDate: '2024-05-20',
    },
    status: TicketStatus.U,
    createdAt: '2024-02-25T10:00:00Z',
    updatedAt: '2024-05-20T14:30:00Z',
  },
  {
    ticketNo: 'G/0325/9999',
    pledgeNo: 'P345678',
    customerId: 'C003',
    customer: {
      id: 'C003',
      nric: 'S5555666C',
      name: 'Ahmad bin Rahman',
      contact: '+65 9876 5432',
    },
    pledge: {
      pledgeNo: 'P345678',
      weight: '15.8g',
      description: '18K Gold Ring set with ruby',
      scrambledNo: 'SC123',
      pledgeCode: 'GR003',
      stCode: 'ST003',
      pCode: 'P003',
    },
    financial: {
      principal: 800.0,
      interest: 24.0,
      months: 3,
      newAmount: 824.0,
      outstandings: 0,
      interestRate: 1.5,
    },
    dates: {
      pawnDate: '2024-03-15',
      expiryDate: '2024-06-15',
      renewalDate: '2024-06-10',
    },
    status: TicketStatus.R,
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-06-10T14:30:00Z',
  },
  {
    ticketNo: 'R/0125/7777',
    pledgeNo: 'P567890',
    customerId: 'C004',
    customer: {
      id: 'C004',
      nric: 'S7777888D',
      name: 'Priya Sharma',
      contact: '+65 8888 9999',
    },
    pledge: {
      pledgeNo: 'P567890',
      weight: '12.1g',
      description: '14K Gold Necklace with emerald',
      scrambledNo: 'SC999',
      pledgeCode: 'GN004',
      stCode: 'ST004',
      pCode: 'P004',
    },
    financial: {
      principal: 650.0,
      interest: 19.5,
      months: 3,
      newAmount: 669.5,
      outstandings: 0,
      interestRate: 1.5,
    },
    dates: {
      pawnDate: '2024-01-15',
      expiryDate: '2024-04-15',
      renewalDate: undefined,
    },
    status: TicketStatus.V,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-04-15T14:30:00Z',
  },
];

// Mock transactions
const mockTransactions: Transaction[] = [
  {
    id: 'T001',
    type: 'renewal',
    ticketNo: 'B/0725/1234',
    customerId: 'C001',
    staffId: 'STAFF001',
    transactionDate: '2024-07-10T14:30:00Z',
    status: 'completed',
    createdAt: '2024-07-10T14:30:00Z',
    payment: {
      cashAmount: 36.0,
      digitalAmount: 0,
      totalCollected: 36.0,
    },
    newTicketNo: 'B/0725/1234',
    interestAmount: 36.0,
  },
  {
    id: 'T002',
    type: 'redemption',
    ticketNo: 'R/0125/7777',
    customerId: 'C004',
    staffId: 'STAFF001',
    transactionDate: '2024-04-15T16:00:00Z',
    status: 'completed',
    createdAt: '2024-04-15T16:00:00Z',
    redeemerType: 'pawner',
    payment: {
      cashAmount: 669.5,
      digitalAmount: 0,
      totalCollected: 669.5,
    },
    totalAmount: 669.5,
  },
];

// Command actions
const commandActions: CommandSearchResult[] = [
  {
    id: 'search',
    type: 'command',
    category: 'commands',
    title: 'Universal Search',
    description: 'Search customers, tickets, and transactions',
    subtitle: 'Quick search across all data',
    icon: Search,
    badge: 'F3',
    action: () => console.log('Navigate to universal search'),
    shortcut: 'F3',
    keywords: ['search', 'find', 'lookup', 'enquiry'],
    relevanceScore: 100,
  },
  {
    id: 'renew',
    type: 'command',
    category: 'commands',
    title: 'Renew Ticket',
    description: 'Process ticket renewal payment',
    subtitle: 'Extend ticket expiry date',
    icon: RotateCcw,
    badge: 'F4',
    action: () => console.log('Navigate to renewal'),
    shortcut: 'F4',
    keywords: ['renew', 'renewal', 'extend', 'payment'],
    relevanceScore: 90,
  },
  {
    id: 'redeem',
    type: 'command',
    category: 'commands',
    title: 'Redeem Ticket',
    description: 'Process ticket redemption',
    subtitle: 'Complete customer item collection',
    icon: FileText,
    badge: 'F5',
    action: () => console.log('Navigate to redemption'),
    shortcut: 'F5',
    keywords: ['redeem', 'redemption', 'collect', 'pickup'],
    relevanceScore: 90,
  },
  {
    id: 'dashboard',
    type: 'command',
    category: 'commands',
    title: 'Dashboard',
    description: 'Go to main dashboard',
    subtitle: 'View overview and statistics',
    icon: TrendingUp,
    badge: 'F1',
    action: () => console.log('Navigate to dashboard'),
    shortcut: 'F1',
    keywords: ['dashboard', 'home', 'main', 'overview'],
    relevanceScore: 80,
  },
  {
    id: 'combined',
    type: 'command',
    category: 'commands',
    title: 'Combined Operations',
    description: 'Process renewal and redemption together',
    subtitle: 'Multiple operations at once',
    icon: Plus,
    action: () => console.log('Navigate to combined operations'),
    keywords: ['combined', 'multiple', 'batch'],
    relevanceScore: 70,
  },
  {
    id: 'lost',
    type: 'command',
    category: 'commands',
    title: 'Lost Pledge Report',
    description: 'Report lost pledge items',
    subtitle: 'Handle missing item reports',
    icon: Hash,
    badge: 'F6',
    action: () => console.log('Navigate to lost pledge'),
    shortcut: 'F6',
    keywords: ['lost', 'pledge', 'report', 'missing'],
    relevanceScore: 60,
  },
  {
    id: 'settings',
    type: 'command',
    category: 'commands',
    title: 'Settings',
    description: 'Application settings and preferences',
    subtitle: 'Configure application options',
    icon: Settings,
    badge: 'F12',
    action: () => console.log('Navigate to settings'),
    shortcut: 'F12',
    keywords: ['settings', 'preferences', 'config'],
    relevanceScore: 40,
  },
  {
    id: 'logout',
    type: 'command',
    category: 'commands',
    title: 'Logout',
    description: 'Sign out of the application',
    subtitle: 'End current session',
    icon: LogOut,
    action: () => console.log('Logout'),
    keywords: ['logout', 'signout', 'exit'],
    relevanceScore: 30,
  },
];

// Mock search service implementation
export class MockSearchService implements SearchProvider {
  private recentItems: SearchResult[] = [];
  private searchHistory: SearchHistoryItem[] = [];

  // Fuzzy search implementation
  private fuzzyMatch(text: string, pattern: string): number {
    if (!pattern) return 0;

    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();

    // Exact match gets highest score
    if (textLower.includes(patternLower)) {
      const exactIndex = textLower.indexOf(patternLower);
      return exactIndex === 0 ? 100 : 80 - exactIndex;
    }

    // Character-by-character fuzzy matching
    let score = 0;
    let patternIndex = 0;

    for (
      let i = 0;
      i < textLower.length && patternIndex < patternLower.length;
      i++
    ) {
      if (textLower[i] === patternLower[patternIndex]) {
        score += 1;
        patternIndex++;
      }
    }

    return patternIndex === patternLower.length
      ? (score / patternLower.length) * 50
      : 0;
  }

  // Search customers
  private searchCustomers(term: string): CustomerSearchResult[] {
    return mockCustomers
      .map(customer => {
        const nameScore = this.fuzzyMatch(customer.name, term);
        const nricScore = this.fuzzyMatch(customer.nric, term);
        const contactScore = this.fuzzyMatch(customer.contact, term);
        const addressScore = this.fuzzyMatch(customer.address, term);

        const maxScore = Math.max(
          nameScore,
          nricScore,
          contactScore,
          addressScore
        );

        if (maxScore < 10) return null;

        // Count active tickets for this customer
        const activeTickets = mockTickets.filter(
          ticket =>
            ticket.customerId === customer.id &&
            ticket.status === TicketStatus.U
        ).length;

        return {
          id: `customer-${customer.id}`,
          type: 'customer' as const,
          category: 'customers' as const,
          title: customer.name,
          description: `${customer.nric} • ${customer.contact}`,
          subtitle: customer.address,
          icon: User,
          badge: activeTickets > 0 ? `${activeTickets} tickets` : undefined,
          data: customer,
          activeTickets,
          relevanceScore: maxScore,
        } as CustomerSearchResult;
      })
      .filter((result): result is CustomerSearchResult => result !== null)
      .sort((a, b) => (b?.relevanceScore || 0) - (a?.relevanceScore || 0));
  }

  // Search tickets
  private searchTickets(term: string): TicketSearchResult[] {
    return mockTickets
      .map(ticket => {
        const ticketScore = this.fuzzyMatch(ticket.ticketNo, term);
        const customerNameScore = this.fuzzyMatch(ticket.customer.name, term);
        const customerNricScore = this.fuzzyMatch(ticket.customer.nric, term);
        const descriptionScore = this.fuzzyMatch(
          ticket.pledge.description,
          term
        );

        const maxScore = Math.max(
          ticketScore,
          customerNameScore,
          customerNricScore,
          descriptionScore
        );

        if (maxScore < 10) return null;

        const expiryDate = new Date(ticket.dates.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        const expiryStatus =
          daysUntilExpiry < 0
            ? 'expired'
            : daysUntilExpiry <= 7
              ? 'expiring'
              : 'active';

        return {
          id: `ticket-${ticket.ticketNo}`,
          type: 'ticket' as const,
          category: 'tickets' as const,
          title: ticket.ticketNo,
          description: `${ticket.customer.name} • $${ticket.financial.principal.toFixed(2)}`,
          subtitle: ticket.pledge.description,
          icon: Package,
          badge: ticket.status,
          data: ticket,
          customerName: ticket.customer.name,
          expiryStatus,
          relevanceScore: maxScore,
        } as TicketSearchResult;
      })
      .filter((result): result is TicketSearchResult => result !== null)
      .sort((a, b) => (b?.relevanceScore || 0) - (a?.relevanceScore || 0));
  }

  // Search transactions
  private searchTransactions(term: string): TransactionSearchResult[] {
    return mockTransactions
      .map(transaction => {
        const ticketScore = this.fuzzyMatch(transaction.ticketNo, term);
        const typeScore = this.fuzzyMatch(transaction.type, term);
        const idScore = this.fuzzyMatch(transaction.id, term);

        const maxScore = Math.max(ticketScore, typeScore, idScore);

        if (maxScore < 10) return null;

        // Get customer name
        const customer = mockCustomers.find(
          c => c.id === transaction.customerId
        );
        const customerName = customer?.name;

        // Get amount based on transaction type
        const amount =
          transaction.type === 'renewal'
            ? (transaction as any).interestAmount
            : (transaction as any).totalAmount;

        return {
          id: `transaction-${transaction.id}`,
          type: 'transaction' as const,
          category: 'transactions' as const,
          title: `${transaction.type.toUpperCase()} - ${transaction.ticketNo}`,
          description: `${customerName || 'Unknown'} • ${transaction.status}`,
          subtitle: new Date(transaction.transactionDate).toLocaleDateString(),
          icon: CreditCard,
          badge: transaction.status,
          data: transaction,
          customerName,
          amount,
          relevanceScore: maxScore,
        } as TransactionSearchResult;
      })
      .filter((result): result is TransactionSearchResult => result !== null)
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  }

  // Search commands
  private searchCommands(term: string): CommandSearchResult[] {
    return commandActions
      .map(command => {
        const titleScore = this.fuzzyMatch(command.title, term);
        const descriptionScore = this.fuzzyMatch(command.description, term);
        const keywordScore = Math.max(
          ...(command.keywords || []).map(keyword =>
            this.fuzzyMatch(keyword, term)
          )
        );

        const maxScore = Math.max(titleScore, descriptionScore, keywordScore);

        if (maxScore < 10) return null;

        return {
          ...command,
          relevanceScore: maxScore,
        } as CommandSearchResult & { relevanceScore: number };
      })
      .filter(
        (result): result is CommandSearchResult & { relevanceScore: number } =>
          result !== null
      )
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  }

  // Main search method
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = performance.now();

    const {
      term,
      limit = 20,
      includeCommands = true,
      includeRecent = true,
    } = query;

    let results: SearchResult[] = [];

    // Search different categories
    if (includeCommands) {
      const commandResults = this.searchCommands(term);
      results.push(...commandResults.slice(0, 5)); // Limit commands to 5
    }

    const customerResults = this.searchCustomers(term);
    const ticketResults = this.searchTickets(term);
    const transactionResults = this.searchTransactions(term);

    results.push(...customerResults);
    results.push(...ticketResults);
    results.push(...transactionResults);

    // Add recent items if enabled and no search term
    if (includeRecent && !term && this.recentItems.length > 0) {
      // Recent items are already properly typed SearchResult[]
      results.unshift(...this.recentItems.slice(0, 5));
    }

    // Sort by relevance and limit results
    results.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    results = results.slice(0, limit);

    const searchTime = performance.now() - startTime;

    // Detect search type
    let detectedType: 'nric' | 'ticket' | 'phone' | 'general' = 'general';
    if (/^[STFG]\d{7}[A-Z]$/i.test(term)) detectedType = 'nric';
    else if (/^[A-Z]\/\d{4}\/\d{4}$/i.test(term)) detectedType = 'ticket';
    else if (/^(\+65\s?)?\d{8}$/i.test(term)) detectedType = 'phone';

    return {
      results,
      totalCount: results.length,
      hasMore: false,
      searchTerm: term,
      detectedType,
      searchTime,
    };
  }

  // Recent items management
  async getRecent(limit = 10): Promise<SearchResult[]> {
    return this.recentItems.slice(0, limit);
  }

  async addToRecent(result: SearchResult): Promise<void> {
    // Remove if already exists
    this.recentItems = this.recentItems.filter(item => item.id !== result.id);

    // Only add non-command results to recent items
    if (result.type !== 'command') {
      const recentResult: RecentSearchResult = {
        ...result,
        category: 'recent',
        recent: true,
        originalData: (
          result as
            | CustomerSearchResult
            | TicketSearchResult
            | TransactionSearchResult
        ).data,
        lastAccessed: new Date().toISOString(),
      };
      this.recentItems.unshift(recentResult);

      // Keep only last 10
      this.recentItems = this.recentItems.slice(0, 10);
    }
    // Commands are not added to recent items as they are always available
  }

  async clearRecent(): Promise<void> {
    this.recentItems = [];
  }

  // Search history management
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    return this.searchHistory;
  }

  async addToHistory(
    item: Omit<SearchHistoryItem, 'id' | 'timestamp'>
  ): Promise<void> {
    const historyItem: SearchHistoryItem = {
      ...item,
      id: `history-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    this.searchHistory.unshift(historyItem);
    this.searchHistory = this.searchHistory.slice(0, 50); // Keep last 50
  }
}

// Export singleton instance
export const mockSearchService = new MockSearchService();
