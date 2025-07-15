import { Customer, TicketData, Transaction } from './business';
import type { IconComponent } from './ui';

// Enhanced Search Types for Universal Command Palette
export type SearchCategory =
  | 'commands'
  | 'customers'
  | 'tickets'
  | 'transactions'
  | 'recent';

export type SearchResultType =
  | 'command'
  | 'customer'
  | 'ticket'
  | 'transaction';

// Base Search Result Interface
export interface BaseSearchResult {
  id: string;
  type: SearchResultType;
  category: SearchCategory;
  title: string;
  description: string;
  subtitle?: string;
  icon: IconComponent;
  badge?: string;
  metadata?: Record<string, unknown>;
  recent?: boolean;
  relevanceScore?: number;
}

// Command Search Result
export interface CommandSearchResult extends BaseSearchResult {
  type: 'command';
  category: 'commands';
  action: () => void;
  shortcut?: string;
  keywords?: string[];
}

// Customer Search Result
export interface CustomerSearchResult extends BaseSearchResult {
  type: 'customer';
  category: 'customers';
  data: Customer;
  activeTickets?: number;
  totalValue?: number;
}

// Ticket Search Result
export interface TicketSearchResult extends BaseSearchResult {
  type: 'ticket';
  category: 'tickets';
  data: TicketData;
  customerName?: string;
  expiryStatus?: 'active' | 'expiring' | 'expired';
}

// Transaction Search Result
export interface TransactionSearchResult extends BaseSearchResult {
  type: 'transaction';
  category: 'transactions';
  data: Transaction;
  customerName?: string;
  amount?: number;
}

// Recent Search Result
export interface RecentSearchResult extends BaseSearchResult {
  type: 'customer' | 'ticket' | 'transaction';
  category: 'recent';
  originalData: Customer | TicketData | Transaction;
  lastAccessed: string;
}

// Union type for all search results
export type SearchResult =
  | CommandSearchResult
  | CustomerSearchResult
  | TicketSearchResult
  | TransactionSearchResult
  | RecentSearchResult;

// Search Query Interface
export interface SearchQuery {
  term: string;
  category?: SearchCategory[];
  limit?: number;
  includeCommands?: boolean;
  includeRecent?: boolean;
}

// Search Response Interface
export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  hasMore: boolean;
  searchTerm: string;
  detectedType?: 'nric' | 'ticket' | 'phone' | 'general';
  searchTime: number;
}

// Search Filters for Advanced Search
export interface SearchFilters {
  categories: SearchCategory[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  status?: string[];
  includeInactive?: boolean;
}

// Search Configuration
export interface SearchConfig {
  maxResults: number;
  fuzzyThreshold: number;
  enableFuzzySearch: boolean;
  enableRecentSearch: boolean;
  recentLimit: number;
  searchDebounceMs: number;
}

// Search History Item
export interface SearchHistoryItem {
  id: string;
  query: string;
  resultCount: number;
  timestamp: string;
  selectedResult?: {
    id: string;
    type: SearchResultType;
    title: string;
  };
}

// Search Analytics
export interface SearchAnalytics {
  totalSearches: number;
  averageResultCount: number;
  popularQueries: string[];
  categoryUsage: Record<SearchCategory, number>;
  averageSearchTime: number;
}

// Smart Search Pattern Detection
export interface SearchPattern {
  pattern: RegExp;
  type: 'nric' | 'ticket' | 'phone' | 'email' | 'general';
  priority: number;
  formatter?: (match: string) => string;
}

// Search Action Types
export type SearchAction =
  | { type: 'view'; target: 'customer' | 'ticket' | 'transaction'; id: string }
  | { type: 'edit'; target: 'customer' | 'ticket'; id: string }
  | { type: 'process'; target: 'renewal' | 'redemption'; ticketId: string }
  | { type: 'navigate'; path: string }
  | { type: 'command'; commandId: string };

// Enhanced Search Result with Actions
export type EnhancedSearchResult = SearchResult & {
  actions?: SearchAction[];
  preview?: {
    primaryInfo: string;
    secondaryInfo?: string;
    status?: string;
    amount?: number;
    date?: string;
  };
};

// Search Provider Interface
export interface SearchProvider {
  search(query: SearchQuery): Promise<SearchResponse>;
  getRecent(limit?: number): Promise<SearchResult[]>;
  addToRecent(result: SearchResult): Promise<void>;
  clearRecent(): Promise<void>;
  getSearchHistory(): Promise<SearchHistoryItem[]>;
  addToHistory(
    item: Omit<SearchHistoryItem, 'id' | 'timestamp'>
  ): Promise<void>;
}

// Search Context for React
export interface SearchContextValue {
  provider: SearchProvider;
  config: SearchConfig;
  isLoading: boolean;
  lastQuery?: string;
  lastResults?: SearchResult[];
  recentItems: SearchResult[];
  searchHistory: SearchHistoryItem[];
  executeSearch: (query: SearchQuery) => Promise<void>;
  selectResult: (result: SearchResult) => void;
  clearRecent: () => Promise<void>;
  updateConfig: (config: Partial<SearchConfig>) => void;
}
