import React, { useState } from 'react';
import { Search, BookOpen, Keyboard, AlertCircle, FileText, MessageCircle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface QuickAccessCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: string[];
  href?: string;
}

export function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const quickAccessCards: QuickAccessCard[] = [
    {
      title: 'Getting Started',
      description: 'Essential guides for new users',
      icon: <BookOpen className='h-6 w-6' />,
      items: [
        'First-time login and setup',
        'Understanding the dashboard',
        'Basic ticket operations',
        'Customer registration process',
        'Using the command palette'
      ]
    },
    {
      title: 'Keyboard Shortcuts',
      description: 'Speed up your workflow',
      icon: <Keyboard className='h-6 w-6' />,
      items: [
        'Ctrl+K / Cmd+K - Command Palette',
        'Enter - Execute primary action',
        'Tab - Navigate form fields',
        'Escape - Cancel or close',
        'F3 - Quick search'
      ]
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: <AlertCircle className='h-6 w-6' />,
      items: [
        'Login and authentication issues',
        'Form validation errors',
        'Network connectivity problems',
        'Printer setup and configuration',
        'Data sync and backup issues'
      ]
    }
  ];

  const faqItems: FAQItem[] = [
    {
      id: 'ticket-renewal',
      question: 'How do I renew a ticket?',
      answer: 'To renew a ticket: 1) Navigate to Transactions > Ticket Renewal, 2) Enter the ticket number in the lookup field, 3) Verify customer details and calculate new amounts, 4) Process payment and confirm renewal. The system will automatically update the ticket status and generate a new receipt.',
      category: 'Transactions'
    },
    {
      id: 'dual-staff-auth',
      question: 'When is dual staff authentication required?',
      answer: 'Dual staff authentication is required for: High-value transactions (above configured limit), Ticket redemptions by different redeemers, Lost pledge reporting, System configuration changes, and End-of-day reconciliation. A second staff member must provide their credentials to complete these operations.',
      category: 'Security'
    },
    {
      id: 'customer-search',
      question: 'How can I search for customers?',
      answer: 'Use the Universal Enquiry (FUNC-03) to search customers by: NRIC (full number), Name (partial matching supported), Phone number (with country code), or Ticket number. The search will return matching customers and their associated tickets.',
      category: 'Customer Management'
    },
    {
      id: 'lost-item-process',
      question: 'What is the process for reporting lost items?',
      answer: 'For lost items: 1) Navigate to Transactions > Lost Pledge Management, 2) Add the affected ticket numbers, 3) Provide detailed description of the loss, 4) Upload supporting documents (police report, statutory declaration), 5) Generate the official lost pledge report. Police reports are mandatory for stolen items.',
      category: 'Lost Items'
    },
    {
      id: 'payment-methods',
      question: 'What payment methods are accepted?',
      answer: 'The system supports: Cash payments (with change calculation), NETS/Credit card transactions, Bank transfers (with reference numbers), and Multi-payment splitting. All payments are recorded with timestamps and staff authentication for audit purposes.',
      category: 'Payments'
    },
    {
      id: 'system-backup',
      question: 'How often is data backed up?',
      answer: 'Data is automatically backed up: Every 4 hours during business hours, Daily full backup at end-of-day, Weekly archive to external storage, and Real-time synchronization for critical transactions. Manual backups can be triggered from the system settings.',
      category: 'System'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // TODO: Implement actual search logic
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQs = faqItems.filter(faq =>
    searchQuery.trim() === '' ||
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-foreground mb-2'>
            Help & Support
          </h1>
          <p className='text-muted-foreground'>
            Find answers, guides, and support resources for the ValueMax Vampire system
          </p>
        </div>
        <div className='text-right'>
          <div className='text-sm text-muted-foreground'>System Version</div>
          <div className='text-lg font-semibold text-foreground font-mono'>v1.0.0</div>
        </div>
      </div>

      {/* Search Section */}
      <div className='search-container'>
        <form onSubmit={handleSearch} className='relative'>
          <div className='search-bar'>
            <div className='search-icon'>
              <Search className={cn('h-5 w-5 text-muted-foreground', isSearching && 'animate-pulse')} />
            </div>
            <input
              className='search-input'
              type='text'
              placeholder='Search help articles, FAQs, or keywords...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            {isSearching && (
              <div className='absolute right-4 top-1/2 -translate-y-1/2'>
                <div className='loading-spinner w-4 h-4'></div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Quick Access Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {quickAccessCards.map((card, index) => (
          <div key={index} className='card card-hover cursor-pointer'>
            <div className='card-header'>
              <h3 className='card-title flex items-center gap-2'>
                <div className='p-2 bg-primary/10 rounded-lg text-primary'>
                  {card.icon}
                </div>
                {card.title}
              </h3>
              <p className='text-sm text-muted-foreground mt-1'>
                {card.description}
              </p>
            </div>
            <div className='p-6 pt-0'>
              <ul className='space-y-2'>
                {card.items.map((item, itemIndex) => (
                  <li key={itemIndex} className='text-sm text-muted-foreground flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className='mt-4 pt-4 border-t'>
                <button className='text-primary text-sm font-medium hover:underline flex items-center gap-1'>
                  View all guides
                  <ExternalLink className='h-3 w-3' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Frequently Asked Questions</h3>
          <p className='text-sm text-muted-foreground mt-1'>
            {searchQuery.trim() 
              ? `Showing ${filteredFAQs.length} results for "${searchQuery}"`
              : `${faqItems.length} common questions and answers`
            }
          </p>
        </div>
        <div className='p-6 pt-0'>
          <div className='space-y-4'>
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className='border border-muted/30 rounded-lg'>
                <button
                  className='w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors'
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-3'>
                      <span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium'>
                        {faq.category}
                      </span>
                      <h4 className='font-medium text-foreground'>{faq.question}</h4>
                    </div>
                  </div>
                  <div className='ml-4'>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className='h-5 w-5 text-muted-foreground' />
                    ) : (
                      <ChevronRight className='h-5 w-5 text-muted-foreground' />
                    )}
                  </div>
                </button>
                {expandedFAQ === faq.id && (
                  <div className='px-4 pb-4 text-sm text-muted-foreground border-t border-muted/30 bg-muted/10'>
                    <div className='pt-4'>
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredFAQs.length === 0 && searchQuery.trim() && (
            <div className='text-center py-8'>
              <Search className='h-12 w-12 text-muted-foreground mx-auto mb-3' />
              <p className='text-muted-foreground'>No results found for "{searchQuery}"</p>
              <p className='text-sm text-muted-foreground mt-1'>
                Try different keywords or browse the categories above
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feature Documentation Section */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Feature Documentation
          </h3>
          <p className='text-sm text-muted-foreground mt-1'>
            Comprehensive guides for all system features and functions
          </p>
        </div>
        <div className='p-6 pt-0'>
          <div className='bg-muted/30 p-6 rounded-lg text-center'>
            <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground'>Detailed feature guides will be listed here</p>
            <p className='text-sm text-muted-foreground mt-2'>
              Step-by-step tutorials for ticket operations, customer management, reporting, and system administration
            </p>
            <div className='mt-4'>
              <button className='btn-secondary text-sm'>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Support Section */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title flex items-center gap-2'>
            <MessageCircle className='h-5 w-5' />
            Contact & Support
          </h3>
          <p className='text-sm text-muted-foreground mt-1'>
            Get help from our support team when you need it
          </p>
        </div>
        <div className='p-6 pt-0'>
          <div className='bg-muted/30 p-6 rounded-lg text-center'>
            <MessageCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground'>Support contact information and ticketing system will be available here</p>
            <p className='text-sm text-muted-foreground mt-2'>
              Live chat, email support, phone numbers, and support ticket management
            </p>
            <div className='mt-4'>
              <button className='btn-secondary text-sm'>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Tips */}
      <div className='card bg-blue-50'>
        <div className='p-4'>
          <h4 className='font-semibold text-blue-800 mb-2'>Quick Tips</h4>
          <div className='text-sm text-blue-700 space-y-1'>
            <p>• Use Ctrl+K (Cmd+K) to open the command palette from anywhere in the system</p>
            <p>• Press F1 while on any page to get context-specific help</p>
            <p>• Most forms support Enter key for quick submission and Tab for field navigation</p>
            <p>• Use the search function above to quickly find specific help topics</p>
          </div>
        </div>
      </div>
    </div>
  );
}