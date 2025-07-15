import { useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrentPage?: boolean;
}

// Route mapping for breadcrumb generation
const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/transactions/renewal': 'Ticket Renewals',
  '/transactions/redemption': 'Ticket Redemptions',
  '/transactions/combined': 'Combined Operations',
  '/transactions/lost-pledge': 'Lost Pledge Management',
  '/enquiry': 'Universal Enquiry',
  '/reports': 'Reports',
  '/reports/credit-rating': 'Credit Rating Assessment',
  '/reports/lost-letter': 'Lost Letter Reprinting',
  '/settings': 'Settings',
  '/help': 'Help & Support',
};

// Function code mapping for dynamic breadcrumbs
const functionCodes: Record<string, string> = {
  '/transactions/renewal': 'FUNC-01',
  '/transactions/redemption': 'FUNC-02',
  '/enquiry': 'FUNC-03',
  '/transactions/lost-pledge': 'FUNC-04',
  '/reports/lost-letter': 'FUNC-05',
  '/transactions/combined': 'FUNC-06',
  '/reports/credit-rating': 'FUNC-07',
};

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with ValueMax
  breadcrumbs.push({
    label: 'ValueMax',
    path: '/',
  });

  // Build breadcrumbs from path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLastSegment = index === pathSegments.length - 1;
    
    const label = routeLabels[currentPath] || segment;
    
    breadcrumbs.push({
      label,
      ...(isLastSegment ? {} : { path: currentPath }),
      isCurrentPage: isLastSegment,
    });
  });

  return breadcrumbs;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  return generateBreadcrumbs(location.pathname);
}

export function getFunctionCode(pathname: string): string | null {
  return functionCodes[pathname] || null;
}