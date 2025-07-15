import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  RotateCcw,
  CreditCard,
  Shuffle,
  AlertTriangle,
  FileText,
  HelpCircle,
  Users,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

const navItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    shortcut: 'Ctrl+Home',
  },
];

const transactionItems = [
  {
    title: 'Ticket Renewals',
    path: '/transactions/renewal',
    icon: RotateCcw,
    shortcut: 'F4',
  },
  {
    title: 'Ticket Redemptions',
    path: '/transactions/redemption',
    icon: CreditCard,
    shortcut: 'F5',
  },
  {
    title: 'Combined Operations',
    path: '/transactions/combined',
    icon: Shuffle,
    shortcut: 'F7',
  },
  {
    title: 'Lost Pledge Management',
    path: '/transactions/lost-pledge',
    icon: AlertTriangle,
    shortcut: 'Alt+L',
  },
];

const enquiryItems = [
  {
    title: 'Universal Enquiry',
    path: '/enquiry',
    icon: Search,
    shortcut: 'F3',
  },
];

const reportItems = [
  {
    title: 'Credit Rating Assessment',
    path: '/reports/credit-rating',
    icon: Users,
    shortcut: 'Alt+CR',
  },
  {
    title: 'Lost Letter Reprinting',
    path: '/reports/lost-letter',
    icon: FileText,
    shortcut: 'F6',
  },
];

const settingsItems = [
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    shortcut: 'F12',
  },
  {
    title: 'Help & Support',
    path: '/help',
    icon: HelpCircle,
    shortcut: 'F1',
  },
];

function NavSection({ title, items, isCollapsed }: { title: string, items: typeof navItems, isCollapsed: boolean }) {
  return (
    <div className="nav-group">
      {!isCollapsed && <div className="nav-group-title">{title}</div>}
      {items.map(item => (
        <NavLink key={item.title} to={item.path} end>
          {({ isActive }) => (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  className={clsx(
                    'nav-item',
                    isActive && 'active',
                    !isCollapsed ? 'justify-between' : 'justify-center px-2'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    {!isCollapsed && (
                      <span className='text-body-small font-medium whitespace-nowrap'>{item.title}</span>
                    )}
                  </div>
                  {!isCollapsed && item.shortcut && (
                    <span className="nav-shortcut">{item.shortcut}</span>
                  )}
                </div>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side='right'
                  className='bg-primary text-primary-foreground'
                >
                  <div className="text-center">
                    <p>{item.title}</p>
                    {item.shortcut && (
                      <p className="text-caption opacity-80">{item.shortcut}</p>
                    )}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <nav className="app-sidebar">
      <div className={clsx(
        'border-b border-border flex items-center transition-all duration-300',
        'h-[var(--header-height)]', // Match header height exactly
        sidebarOpen ? 'px-6' : 'px-4 justify-center'
      )}>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0' style={{ backgroundColor: 'var(--color-brand-red)' }}>
            <span className='text-white font-bold text-body-small'>V</span>
          </div>
          {sidebarOpen && (
            <div className='min-w-0'>
              <div className='text-body font-bold truncate' style={{ color: 'var(--color-text-primary)' }}>
                ValueMax
              </div>
              <div className='text-caption truncate' style={{ color: 'var(--color-text-secondary)' }}>
                Vampire System
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-nav">
        <TooltipProvider>
          {/* Dashboard */}
          <NavSection title="Overview" items={navItems} isCollapsed={!sidebarOpen} />
          
          {/* Transactions */}
          <NavSection title="Transactions" items={transactionItems} isCollapsed={!sidebarOpen} />
          
          {/* Enquiry */}
          <NavSection title="Search & Enquiry" items={enquiryItems} isCollapsed={!sidebarOpen} />
          
          {/* Reports */}
          <NavSection title="Reports" items={reportItems} isCollapsed={!sidebarOpen} />
        </TooltipProvider>
      </div>

      {/* Bottom Section */}
      <div className={clsx(
        'mt-auto border-t space-y-2 transition-all duration-300',
        sidebarOpen ? 'p-4' : 'p-2 flex flex-col items-center'
      )}>
        <TooltipProvider>
          {/* Settings & Help */}
          <NavSection title="System" items={settingsItems} isCollapsed={!sidebarOpen} />

          {/* Collapse Button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                className={clsx(
                  'nav-item cursor-pointer mt-4',
                  !sidebarOpen && 'justify-center px-2'
                )}
                onClick={toggleSidebar}
              >
                <div className="flex items-center gap-3">
                  {sidebarOpen ? (
                    <PanelLeftClose className='h-5 w-5 flex-shrink-0' />
                  ) : (
                    <PanelLeftOpen className='h-5 w-5 flex-shrink-0' />
                  )}
                  {sidebarOpen && <span className='text-body-small font-medium whitespace-nowrap'>Collapse</span>}
                </div>
              </div>
            </TooltipTrigger>
            {!sidebarOpen && (
              <TooltipContent
                side='right'
                className='bg-primary text-primary-foreground'
              >
                <p>{sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
}
