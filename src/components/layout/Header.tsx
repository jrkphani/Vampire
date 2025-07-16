import React from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Kbd } from '@/components/ui/kbd';
import { useBreadcrumbs, getFunctionCode } from '@/lib/breadcrumbs';
import { Link } from 'react-router-dom';
import { GlobalDateTimeLocation } from '@/components/system/GlobalDateTimeLocation';

interface HeaderProps {
  title?: string | undefined;
  breadcrumbs?: any[]; // Legacy support - will use automatic breadcrumbs if not provided
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const { setCommandPaletteOpen } = useUIStore();
  const { staff, logout } = useAuthStore();
  const breadcrumbs = useBreadcrumbs();
  const functionCode = getFunctionCode(window.location.pathname);

  return (
    <header className='app-header'>
      {/* Left Section: Title and Breadcrumbs */}
      <div className='flex flex-col'>
        <div className='flex items-center gap-2'>
          {title && <h1 className='text-h2'>{title}</h1>}
          {functionCode && (
            <span className='text-caption px-2 py-1 rounded-md bg-muted text-muted-foreground font-mono'>
              {functionCode}
            </span>
          )}
        </div>
        {breadcrumbs.length > 1 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.label}>
                  <BreadcrumbItem>
                    {crumb.isCurrentPage ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.path || '/'}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Center Section: Command Palette Trigger */}
      <div className='flex-1 flex justify-center max-w-md mx-4'>
        <Button
          variant='outline'
          className='w-full flex items-center justify-between text-muted-foreground hover:text-foreground'
          onClick={() => {
            console.log('Open command palette');
            setCommandPaletteOpen(true);
          }}
        >
          <div className='flex items-center gap-2'>
            <Search className='h-4 w-4' />
            <span>Search</span>
          </div>
          <Kbd className='hidden md:inline-flex'>⌘K</Kbd>
        </Button>
      </div>

      {/* Right Section: Actions, User Menu, and Global Date/Time/Location */}
      <div className='flex items-center gap-4'>
        {/* Contextual Actions */}
        {actions}

        {/* Notifications */}
        <Button
          variant='ghost'
          size='icon'
          aria-label='Notifications'
          className='h-9 w-9'
        >
          <Bell className='h-4 w-4' />
        </Button>

        {/* User Menu */}
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border'>
            <div className='w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0'>
              <User className='h-4 w-4 text-primary-foreground' />
            </div>
            <div className='hidden sm:flex flex-col'>
              <span className='text-body-small font-medium text-foreground'>
                {staff?.name || 'Guest User'}
              </span>
              <span className='text-caption text-muted-foreground'>
                {staff?.role || 'Staff'}
              </span>
            </div>
          </div>

          <Button
            variant='ghost'
            size='icon'
            onClick={logout}
            aria-label='Logout'
            className='h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10'
          >
            <LogOut className='h-4 w-4' />
          </Button>
        </div>

        {/* Global Date/Time/Location */}
        <GlobalDateTimeLocation />
      </div>
    </header>
  );
}
