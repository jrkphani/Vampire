import { NavLink, Link } from 'react-router-dom';
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
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    {!isCollapsed && (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span className='text-body-small font-medium whitespace-nowrap overflow-hidden text-ellipsis'>
                            {item.title}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side='right' className='bg-primary text-primary-foreground'>
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {!isCollapsed && item.shortcut && (
                    <span className="nav-shortcut flex-shrink-0">{item.shortcut}</span>
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
      {/* Logo Section */}
      <div className={clsx(
        'border-b border-border flex items-center justify-center transition-all duration-300',
        'h-[var(--header-height)]', // Match header height exactly
        sidebarOpen ? 'px-4' : 'px-2'
      )}>
        <TooltipProvider>
          <Link to="/dashboard" className="flex items-center gap-3 sidebar-logo-container">
            {sidebarOpen ? (
              /* Full Logo when expanded */
              <img
                src="/assets/images/valuemax-logo.png"
                alt="ValueMax Logo"
                className="sidebar-logo-full"
              />
            ) : (
              /* Favicon when collapsed */
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <img
                    src="/assets/images/valuemax-favicon.gif"
                    alt="ValueMax"
                    className="sidebar-logo-icon"
                  />
                </TooltipTrigger>
                <TooltipContent
                  side='right'
                  className='bg-primary text-primary-foreground'
                >
                  <div className="text-center">
                    <p>ValueMax</p>
                    <p className="text-caption opacity-80">Vampire System</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </Link>
        </TooltipProvider>
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
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  {sidebarOpen ? (
                    <PanelLeftClose className='h-5 w-5 flex-shrink-0' />
                  ) : (
                    <PanelLeftOpen className='h-5 w-5 flex-shrink-0' />
                  )}
                  {sidebarOpen && (
                    <span className='text-body-small font-medium whitespace-nowrap overflow-hidden text-ellipsis'>
                      Collapse
                    </span>
                  )}
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
