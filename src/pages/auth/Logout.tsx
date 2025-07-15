import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export function Logout() {
  const navigate = useNavigate();
  const { logout, staff } = useAuthStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call the logout service
        await authService.logout();
        
        // Clear the auth store
        logout();
        
        // Show logout success message
        addToast({
          type: 'success',
          title: 'Logged Out Successfully',
          message: 'You have been securely logged out of the system.',
        });
        
        // Redirect to login page after a brief delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error('Logout failed:', error);
        
        // Even if logout fails on the server, clear local state
        logout();
        
        addToast({
          type: 'warning',
          title: 'Logout Warning',
          message: 'You have been logged out locally. Please close your browser for security.',
        });
        
        // Still redirect to login
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    handleLogout();
  }, [logout, navigate, addToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-red rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-display font-bold text-gray-900">ValueMax Vampire</h2>
          <p className="mt-2 text-body-small text-gray-600">
            Logging you out securely...
          </p>
        </div>

        {/* Logout Status */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center space-y-6">
            {/* Loading Spinner */}
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-brand-red" />
            </div>
            
            {/* Staff Info */}
            {staff && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Goodbye, {staff.name}</span>
                </div>
                <p className="text-body-small text-gray-600">
                  Your session has been terminated securely.
                </p>
              </div>
            )}
            
            {/* Progress Steps */}
            <div className="space-y-3 text-body-small text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Clearing session data...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Invalidating authentication token...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-brand-red" />
                <span>Redirecting to login...</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-caption text-gray-500">
                Please wait while we securely log you out of the system.
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center text-body-small text-gray-500 space-y-2">
          <p className="font-semibold">Security Notice:</p>
          <p>For additional security, please close all browser windows.</p>
        </div>
      </div>
    </div>
  );
}