import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { EnhancedCommandPalette } from '@/components/ui/enhanced-command-palette';
import { mockSearchService } from '@/services/mockSearchService';
import type { SearchQuery, SearchResponse, SearchResult } from '@/types/search';

export function EnhancedGlobalCommandPalette() {
  const navigate = useNavigate();
  const { commandPaletteOpen, setCommandPaletteOpen, addToast } = useUIStore();
  const { logout } = useAuthStore();

  // Handle search requests
  const handleSearch = async (query: SearchQuery): Promise<SearchResponse> => {
    try {
      return await mockSearchService.search(query);
    } catch (error) {
      console.error('Search failed:', error);
      return {
        results: [],
        totalCount: 0,
        hasMore: false,
        searchTerm: query.term,
        searchTime: 0,
      };
    }
  };

  // Handle result selection
  const handleResultSelect = async (result: SearchResult) => {
    // Add to recent items
    await mockSearchService.addToRecent(result);

    // Add to search history
    await mockSearchService.addToHistory({
      query: result.title,
      resultCount: 1,
      selectedResult: {
        id: result.id,
        type: result.type,
        title: result.title,
      },
    });

    // Handle different result types
    switch (result.type) {
      case 'command':
        handleCommandAction(result.id);
        break;

      case 'customer':
        navigate(`/enquiry?customer=${(result as any).data.id}`);
        addToast({
          title: 'Navigation',
          message: `Opened customer: ${(result as any).data.name}`,
          type: 'success',
        });
        break;

      case 'ticket':
        navigate(`/enquiry?ticket=${(result as any).data.ticketNo}`);
        addToast({
          title: 'Navigation',
          message: `Opened ticket: ${(result as any).data.ticketNo}`,
          type: 'success',
        });
        break;

      case 'transaction':
        addToast({
          title: 'Info',
          message: `Transaction details: ${(result as any).data.id}`,
          type: 'info',
        });
        break;

      default:
        console.warn('Unknown result type:', (result as any).type);
    }
  };

  // Handle command actions
  const handleCommandAction = (commandId: string) => {
    switch (commandId) {
      case 'search':
        navigate('/enquiry');
        addToast({
          title: 'Navigation',
          message: 'Opened Universal Search',
          type: 'success',
        });
        break;

      case 'renew':
        navigate('/transactions/renewal');
        addToast({
          title: 'Navigation',
          message: 'Opened Ticket Renewal',
          type: 'success',
        });
        break;

      case 'redeem':
        navigate('/transactions/redemption');
        addToast({
          title: 'Navigation',
          message: 'Opened Ticket Redemption',
          type: 'success',
        });
        break;

      case 'dashboard':
        navigate('/dashboard');
        addToast({
          title: 'Navigation',
          message: 'Opened Dashboard',
          type: 'success',
        });
        break;

      case 'combined':
        navigate('/transactions/combined');
        addToast({
          title: 'Navigation',
          message: 'Opened Combined Operations',
          type: 'success',
        });
        break;

      case 'lost':
        navigate('/transactions/lost-pledge');
        addToast({
          title: 'Navigation',
          message: 'Opened Lost Pledge Management',
          type: 'success',
        });
        break;

      case 'credit':
        navigate('/reports/credit-rating');
        addToast({
          title: 'Navigation',
          message: 'Opened Credit Rating Assessment',
          type: 'success',
        });
        break;

      case 'settings':
        addToast({
          title: 'Feature',
          message: 'Settings page not yet implemented',
          type: 'info',
        });
        break;

      case 'logout':
        logout();
        addToast({
          title: 'Authentication',
          message: 'Logged out successfully',
          type: 'success',
        });
        break;

      default:
        addToast({
          title: 'Info',
          message: `Command "${commandId}" executed`,
          type: 'info',
        });
    }
  };

  return (
    <EnhancedCommandPalette
      isOpen={commandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
      onSearch={handleSearch}
      onResultSelect={handleResultSelect}
      placeholder='Search commands, customers, tickets, transactions...'
      maxResults={25}
      enableFuzzySearch={true}
      enableRecentSearch={true}
    />
  );
}
