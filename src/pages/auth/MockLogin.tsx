import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Users, Loader2, ArrowRight } from 'lucide-react';
import { mockStaffMembers } from '@/mocks/enhancedHandlers';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/api';

export function MockLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  // Get the intended destination or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleMockLogin = async (staffMember: typeof mockStaffMembers[0]) => {
    setIsLoading(true);
    setSelectedStaff(staffMember.id);

    try {
      // Call the mock login service
      const response = await authService.mockLogin(staffMember.code);
      
      // Update the auth store with the staff information
      login(response.staff, response.token, response.refreshToken, response.expiresIn);
      
      // Show success message
      addToast({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${response.staff.name}!`,
      });

      // Redirect to intended destination
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Mock login failed:', error);
      
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: 'Unable to authenticate. Please try again.',
      });
      
    } finally {
      setIsLoading(false);
      setSelectedStaff(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-red rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">ValueMax Vampire</h2>
          <p className="mt-2 text-sm text-gray-600">
            Development Mock Login
          </p>
        </div>

        {/* Mock Login Panel */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Users className="h-5 w-5 text-brand-red" />
                <h3 className="text-lg font-semibold text-gray-900">Quick Login</h3>
              </div>
              <p className="text-sm text-gray-600">
                Select a staff member to login instantly
              </p>
            </div>

            {/* Staff Member Buttons */}
            <div className="space-y-3">
              {mockStaffMembers.map((staffMember) => (
                <button
                  key={staffMember.id}
                  onClick={() => handleMockLogin(staffMember)}
                  disabled={isLoading}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-brand-red hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {staffMember.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {staffMember.role} • {staffMember.code}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Permissions: {staffMember.permissions.slice(0, 3).join(', ')}
                        {staffMember.permissions.length > 3 && ` +${staffMember.permissions.length - 3} more`}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isLoading && selectedStaff === staffMember.id ? (
                        <Loader2 className="h-5 w-5 text-brand-red animate-spin" />
                      ) : (
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-brand-red" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Development Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center text-sm">
                <p className="text-blue-800 font-semibold mb-1">Development Mode</p>
                <p className="text-blue-700">
                  This is a development-only feature for faster testing.
                  Production uses secure credential authentication.
                </p>
              </div>
            </div>

            {/* Alternative Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Need to test credential authentication?
              </p>
              <button
                onClick={() => navigate('/login-form')}
                className="text-brand-red hover:text-red-700 font-medium text-sm"
              >
                Use Standard Login Form
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>ValueMax Pawnshop Operations System</p>
          <p>Development Environment</p>
        </div>
      </div>
    </div>
  );
}