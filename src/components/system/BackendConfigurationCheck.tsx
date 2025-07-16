import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface BackendConfigurationCheckProps {
  children: React.ReactNode;
}

export function BackendConfigurationCheck({ children }: BackendConfigurationCheckProps) {
  // Only show this in production when no backend is configured
  const isProduction = !import.meta.env.DEV;
  const hasBackendConfig = !!import.meta.env.VITE_API_BASE_URL;
  
  if (!isProduction || hasBackendConfig) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
            Backend Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-muted-foreground">
            <p className="mb-4">
              This ValueMax Vampire frontend application is deployed successfully, but it needs to be connected to a backend API server to function properly.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-amber-800 mb-2">Current Status</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>✅ Frontend deployed successfully</li>
                <li>✅ Mock Service Worker correctly disabled in production</li>
                <li>❌ Backend API URL not configured</li>
                <li>❌ API calls will result in 404 errors</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">To Fix This Issue</h4>
              <ol className="text-sm text-blue-700 space-y-2">
                <li>1. <strong>Deploy your backend API</strong> to a server (AWS, Azure, etc.)</li>
                <li>2. <strong>Configure environment variable</strong> in AWS Amplify Console:</li>
                <div className="bg-blue-100 rounded p-3 font-mono text-xs mt-1">
                  <div>Variable: <code>VITE_API_BASE_URL</code></div>
                  <div>Value: <code>https://your-backend-api.com/api</code></div>
                </div>
                <li>3. <strong>Redeploy</strong> your Amplify application</li>
                <li>4. <strong>Test</strong> the authentication and API functionality</li>
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <a 
                href="https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configure Environment Variables
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              Check Configuration Again
            </Button>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-4">
            <p><strong>For Developers:</strong> This component only shows in production when <code>VITE_API_BASE_URL</code> is not configured. In development mode, Mock Service Worker provides API responses.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}