import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const loginSchema = z.object({
  staffId: z
    .string()
    .min(1, 'Staff ID is required')
    .min(3, 'Staff ID must be at least 3 characters')
    .max(20, 'Staff ID must not exceed 20 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Get the intended destination or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      staffId: '',
      password: '',
      rememberMe: false,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // Call the authentication service
      const response = await authService.login(data.staffId, data.password);
      
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
      console.error('Login failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      
      // Set form-level error for invalid credentials
      if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('incorrect')) {
        setError('staffId', { message: 'Invalid staff ID or password' });
        setError('password', { message: 'Invalid staff ID or password' });
      }
      
      setLoginError(errorMessage);
      
      // Reset password field for security
      reset({ 
        staffId: data.staffId, 
        password: '', 
        rememberMe: data.rememberMe 
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-red rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-h1 font-bold text-gray-900">ValueMax Vampire</h2>
          <p className="mt-2 text-body-small text-gray-600">
            Staff Authentication Required
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Error Display */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Login Failed</span>
                </div>
                <p className="text-red-700 mt-1 text-body-small">{loginError}</p>
              </div>
            )}

            {/* Staff ID Field */}
            <div className="form-group">
              <label className="form-label required" htmlFor="staff-id">
                Staff ID
              </label>
              <Input
                id="staff-id"
                {...register('staffId')}
                className={cn(
                  'text-mono',
                  errors.staffId && 'border-red-500 focus:border-red-500'
                )}
                type="text"
                placeholder="Enter your staff ID"
                autoComplete="username"
                autoFocus
              />
              {errors.staffId && (
                <div className="flex items-center gap-1 mt-1 text-body-small text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.staffId.message}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label required" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  {...register('password')}
                  className={cn(
                    'pr-12',
                    errors.password && 'border-red-500 focus:border-red-500'
                  )}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-body-small text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password.message}
                </div>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <Input
                {...register('rememberMe')}
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-body-small text-gray-900">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              variant="default"
              className="w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-body-small text-gray-600">
              Secure access to ValueMax pawnshop operations
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-body-small text-gray-500">
          <p>Having trouble logging in?</p>
          <p>Contact your system administrator for assistance.</p>
        </div>

        {/* Demo Credentials (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-body-small text-blue-800 font-semibold mb-2">Demo Credentials:</p>
            <div className="text-caption text-blue-700 space-y-1">
              <p><strong>Staff ID:</strong> STAFF001</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}