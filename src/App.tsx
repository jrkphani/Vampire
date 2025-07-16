import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BackendConfigurationCheck } from '@/components/system/BackendConfigurationCheck';
import { HeroPage } from '@/pages/HeroPage';
import { MockLogin } from '@/pages/auth/MockLogin';
import { Login } from '@/pages/auth/Login';
import { Logout } from '@/pages/auth/Logout';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { TicketRenewal } from '@/pages/transactions/TicketRenewal';
import { TicketRedemption } from '@/pages/transactions/TicketRedemption';
import { LostPledgeManagement } from '@/pages/transactions/LostPledgeManagement';
import { CombinedOperations } from '@/pages/transactions/CombinedOperations';
import { LostLetterReprinting } from '@/pages/reports/LostLetterReprinting';
import { CreditRatingAssessment } from '@/pages/reports/CreditRatingAssessment';
import { CreditRatingDetail } from '@/pages/reports/CreditRatingDetail';
import { CustomerEnquiry } from '@/pages/enquiry/CustomerEnquiry';
import { SystemSettings } from '@/pages/settings/SystemSettings';
import { HelpSupport } from '@/pages/help/HelpSupport';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <BackendConfigurationCheck>
        <QueryClientProvider client={queryClient}>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path='/' element={<HeroPage />} />
              <Route path='/login' element={<MockLogin />} />
              <Route path='/login-form' element={<Login />} />
              <Route path='/logout' element={<Logout />} />
              
              {/* Protected Routes */}
              <Route path='/*' element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path='/dashboard' element={<Dashboard />} />
                      <Route path='/transactions/renewal' element={<TicketRenewal />} />
                      <Route
                        path='/transactions/redemption'
                        element={<TicketRedemption />}
                      />
                      <Route
                        path='/transactions/lost-pledge'
                        element={<LostPledgeManagement />}
                      />
                      <Route
                        path='/transactions/combined'
                        element={<CombinedOperations />}
                      />
                      <Route
                        path='/reports/lost-letter'
                        element={<LostLetterReprinting />}
                      />
                      <Route
                        path='/reports/credit-rating'
                        element={<CreditRatingAssessment />}
                      />
                      <Route
                        path='/reports/credit-rating/:id'
                        element={<CreditRatingDetail />}
                      />
                      <Route path='/enquiry' element={<CustomerEnquiry />} />
                      <Route path='/settings' element={<SystemSettings />} />
                      <Route path='/help' element={<HelpSupport />} />
                      <Route path='*' element={<div>Page not found</div>} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </QueryClientProvider>
        <Toaster />
      </BackendConfigurationCheck>
    </ErrorBoundary>
  );
}
