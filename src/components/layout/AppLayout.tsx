import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { EnhancedGlobalCommandPalette } from './EnhancedGlobalCommandPalette';
import { GlobalShortcuts } from './GlobalShortcuts';
// import { BreadcrumbItem } from '@/components/ui'

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string | undefined;
  breadcrumbs?: any[]; // BreadcrumbItem[]
  showBreadcrumbs?: boolean;
}

export function AppLayout({
  children,
  title,
  breadcrumbs = [],
  showBreadcrumbs = true,
}: AppLayoutProps) {
  return (
    <div className='app-layout'>
      <Sidebar />

      <Header
        title={title}
        breadcrumbs={showBreadcrumbs ? breadcrumbs : []}
      />

      <main className='app-main'>
        <div className='max-w-7xl mx-auto'>{children}</div>
      </main>

      {/* Enhanced Global Command Palette */}
      <EnhancedGlobalCommandPalette />

      {/* Global Keyboard Shortcuts */}
      <GlobalShortcuts />
    </div>
  );
}
