import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, User, Shield, Bell, Database, Keyboard, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  systemSettingsSchema, 
  type SystemSettingsFormData,
  type UserPreferencesData,
  type SystemConfigurationData,
  getDefaultSettings
} from '@/schemas/system-settings-schema';

type TabKey = 'preferences' | 'system' | 'notifications' | 'privacy';

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>('preferences');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Define state for user preferences and system config
  const [userPreferences, setUserPreferences] = useState<UserPreferencesData>({
    theme: 'light',
    language: 'en',
    dateFormat: 'dd/mm/yyyy',
    currencyDisplay: 'symbol',
    timeFormat: '24',
    numberFormat: '1,234.56',
    fontSize: 'medium',
    compactMode: false,
    showTooltips: true,
    animationsEnabled: true
  });
  
  const [systemConfig, setSystemConfig] = useState<SystemConfigurationData>({
    dualStaffAuth: true,
    maxLoginAttempts: 3,
    accountLockoutDuration: 15,
    passwordExpiryDays: 90,
    sessionTimeout: 30,
    autoLogoutTime: 60,
    sessionWarningTime: 10,
    autoSaveDrafts: true,
    autoSaveInterval: 60,
    draftRetentionDays: 30,
    maxDailyTransactions: 1000,
    highValueThreshold: 10000,
    managerApprovalThreshold: 50000,
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupRetentionDays: 30,
    maintenanceWindowStart: '02:00',
    maintenanceWindowEnd: '04:00',
    auditLogRetention: 365,
    detailedLogging: true,
    complianceMode: true,
    maxConcurrentUsers: 50,
    queryTimeout: 30,
    cacheExpiry: 300
  });

  const {
    handleSubmit,
    reset
  } = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    mode: 'onChange',
    defaultValues: getDefaultSettings()
  });

  const tabs = [
    {
      key: 'preferences' as TabKey,
      label: 'User Preferences',
      icon: <User className='h-4 w-4' />
    },
    {
      key: 'system' as TabKey,
      label: 'System Configuration',
      icon: <Settings className='h-4 w-4' />
    },
    {
      key: 'notifications' as TabKey,
      label: 'Notification Settings',
      icon: <Bell className='h-4 w-4' />
    },
    {
      key: 'privacy' as TabKey,
      label: 'Data & Privacy',
      icon: <Shield className='h-4 w-4' />
    }
  ];

  const keyboardShortcuts = [
    { key: 'Ctrl+K / Cmd+K', description: 'Open Command Palette' },
    { key: 'Enter', description: 'Execute primary action / Submit form' },
    { key: 'Tab', description: 'Navigate between form fields' },
    { key: 'Escape', description: 'Cancel action / Close dialog' },
    { key: 'F1', description: 'Open context help' },
    { key: 'F3', description: 'Open search/enquiry' },
    { key: 'F5', description: 'Refresh current page data' },
    { key: 'F12', description: 'Staff authentication' },
    { key: 'Ctrl+S / Cmd+S', description: 'Save current form' },
    { key: 'Ctrl+R / Cmd+R', description: 'Reset current form' }
  ];

  // Watch for changes to show save success message
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [saveSuccess]);

  const onSubmit = async (data: SystemSettingsFormData) => {
    setIsSaving(true);
    try {
      // TODO: Implement actual settings save
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving settings:', data);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    reset(getDefaultSettings());
    setSaveSuccess(false);
    // Reset state as well
    const defaults = getDefaultSettings();
    setUserPreferences(defaults.userPreferences);
    setSystemConfig(defaults.systemConfiguration);
  };
  
  const handleSaveSettings = () => {
    // Combine all settings into the form data structure
    const formData: SystemSettingsFormData = {
      userPreferences: userPreferences,
      systemConfiguration: systemConfig,
      notificationSettings: {
        emailNotificationsEnabled: true,
        transactionAlerts: true,
        highValueAlerts: true,
        failedLoginAlerts: true,
        systemMaintenanceAlerts: true,
        browserNotificationsEnabled: true,
        soundNotificationsEnabled: true,
        notificationDuration: 5,
        smsNotificationsEnabled: false,
        digestFrequency: 'immediate',
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      },
      dataPrivacy: {
        customerDataRetention: 2555,
        transactionDataRetention: 2555,
        auditTrailRetention: 2555,
        dataSharingEnabled: false,
        analyticsEnabled: true,
        crashReportingEnabled: true,
        allowDataExport: true,
        exportFormat: 'json',
        exportEncryption: true,
        allowDataDeletion: false,
        deletionApprovalRequired: true,
        deletionRetentionDays: 90,
        gdprCompliance: true,
        pdpaCompliance: true,
        dataProcessingLawful: true,
        minimizeDataCollection: true,
        automaticDataCleanup: true,
        dataQualityChecks: true
      }
    };
    
    handleSubmit(() => onSubmit(formData))();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return (
          <div className='space-y-6'>
            {/* Appearance Settings */}
            <div className='card'>
              <div className='card-header'>
                <h3 className='card-title'>Appearance</h3>
                <p className='text-body-small text-muted-foreground mt-1'>
                  Customize the visual appearance of the application
                </p>
              </div>
              <div className='p-6 pt-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='form-group'>
                    <label className='form-label' htmlFor='theme'>
                      Theme
                    </label>
                    <select
                      id='theme'
                      className='input-field'
                      value={userPreferences.theme}
                      onChange={(e) => setUserPreferences({
                        ...userPreferences,
                        theme: e.target.value as UserPreferencesData['theme']
                      })}
                    >
                      <option value='light'>Light</option>
                      <option value='dark'>Dark</option>
                      <option value='system'>System Default</option>
                    </select>
                    <div className='text-caption'>Choose your preferred color scheme</div>
                  </div>
                  <div className='form-group'>
                    <label className='form-label' htmlFor='language'>
                      Language
                    </label>
                    <select
                      id='language'
                      className='input-field'
                      value={userPreferences.language}
                      onChange={(e) => setUserPreferences({
                        ...userPreferences,
                        language: e.target.value as UserPreferencesData['language']
                      })}
                    >
                      <option value='en'>English</option>
                      <option value='zh'>中文 (Chinese)</option>
                      <option value='ms'>Bahasa Melayu</option>
                      <option value='ta'>தமிழ் (Tamil)</option>
                    </select>
                    <div className='text-caption'>Select your preferred language</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className='card'>
              <div className='card-header'>
                <h3 className='card-title'>Regional Settings</h3>
                <p className='text-body-small text-muted-foreground mt-1'>
                  Configure date, time, and currency display formats
                </p>
              </div>
              <div className='p-6 pt-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='form-group'>
                    <label className='form-label' htmlFor='date-format'>
                      Date Format
                    </label>
                    <select
                      id='date-format'
                      className='input-field'
                      value={userPreferences.dateFormat}
                      onChange={(e) => setUserPreferences({
                        ...userPreferences,
                        dateFormat: e.target.value as UserPreferencesData['dateFormat']
                      })}
                    >
                      <option value='dd/mm/yyyy'>DD/MM/YYYY (14/07/2025)</option>
                      <option value='mm/dd/yyyy'>MM/DD/YYYY (07/14/2025)</option>
                      <option value='yyyy-mm-dd'>YYYY-MM-DD (2025-07-14)</option>
                    </select>
                    <div className='text-caption'>Choose how dates are displayed</div>
                  </div>
                  <div className='form-group'>
                    <label className='form-label' htmlFor='currency-display'>
                      Currency Display
                    </label>
                    <select
                      id='currency-display'
                      className='input-field'
                      value={userPreferences.currencyDisplay}
                      onChange={(e) => setUserPreferences({
                        ...userPreferences,
                        currencyDisplay: e.target.value as UserPreferencesData['currencyDisplay']
                      })}
                    >
                      <option value='symbol'>Symbol ($100.00)</option>
                      <option value='code'>Code (SGD 100.00)</option>
                      <option value='name'>Full Name (100.00 Singapore Dollars)</option>
                    </select>
                    <div className='text-caption'>Choose how currency amounts are displayed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className='card'>
              <div className='card-header'>
                <h3 className='card-title flex items-center gap-2'>
                  <Keyboard className='h-5 w-5' />
                  Keyboard Shortcuts
                </h3>
                <p className='text-body-small text-muted-foreground mt-1'>
                  System-wide keyboard shortcuts for efficient navigation
                </p>
              </div>
              <div className='p-6 pt-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className='flex justify-between items-center py-2 border-b border-muted/30 last:border-b-0'>
                      <span className='text-body-small text-muted-foreground'>{shortcut.description}</span>
                      <kbd className='px-2 py-1 bg-muted text-caption font-mono rounded border'>
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className='space-y-6'>
            {/* Security Settings */}
            <div className='card'>
              <div className='card-header'>
                <h3 className='card-title'>Security Settings</h3>
                <p className='text-body-small text-muted-foreground mt-1'>
                  Configure authentication and security policies
                </p>
              </div>
              <div className='p-6 pt-0'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='form-label'>Dual Staff Authentication</label>
                      <div className='text-caption'>
                        Require two staff members for sensitive operations
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='dual-staff-auth'
                        className='h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded'
                        checked={systemConfig.dualStaffAuth}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          dualStaffAuth: e.target.checked
                        })}
                      />
                      <label htmlFor='dual-staff-auth' className='ml-2 text-body-small'>
                        {systemConfig.dualStaffAuth ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='form-group'>
                      <label className='form-label' htmlFor='max-login-attempts'>
                        Maximum Login Attempts
                      </label>
                      <input
                        id='max-login-attempts'
                        className='input-field'
                        type='number'
                        min='1'
                        max='10'
                        value={systemConfig.maxLoginAttempts}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          maxLoginAttempts: parseInt(e.target.value) || 3
                        })}
                      />
                      <div className='text-caption'>Lock account after failed attempts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Management */}
            <div className='card'>
              <div className='card-header'>
                <h3 className='card-title'>Session Management</h3>
                <p className='text-body-small text-muted-foreground mt-1'>
                  Configure session timeouts and automatic logout behavior
                </p>
              </div>
              <div className='p-6 pt-0'>
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='form-group'>
                      <label className='form-label' htmlFor='session-timeout'>
                        Session Timeout (minutes)
                      </label>
                      <input
                        id='session-timeout'
                        className='input-field'
                        type='number'
                        min='5'
                        max='120'
                        value={systemConfig.sessionTimeout}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          sessionTimeout: parseInt(e.target.value) || 30
                        })}
                      />
                      <div className='text-caption'>Warn user before session expires</div>
                    </div>
                    <div className='form-group'>
                      <label className='form-label' htmlFor='auto-logout-time'>
                        Auto Logout Time (minutes)
                      </label>
                      <input
                        id='auto-logout-time'
                        className='input-field'
                        type='number'
                        min='10'
                        max='240'
                        value={systemConfig.autoLogoutTime}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          autoLogoutTime: parseInt(e.target.value) || 60
                        })}
                      />
                      <div className='text-caption'>Automatically logout after inactivity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className='card'>
              <div className='card-header'>
                <h3 className='card-title'>Data Management</h3>
                <p className='text-body-small text-muted-foreground mt-1'>
                  Configure automatic data saving and backup settings
                </p>
              </div>
              <div className='p-6 pt-0'>
                <div className='flex items-center justify-between'>
                  <div>
                    <label className='form-label'>Auto-save Drafts</label>
                    <div className='text-caption'>
                      Automatically save form data as you type
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='auto-save-drafts'
                      className='h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded'
                      checked={systemConfig.autoSaveDrafts}
                      onChange={(e) => setSystemConfig({
                        ...systemConfig,
                        autoSaveDrafts: e.target.checked
                      })}
                    />
                    <label htmlFor='auto-save-drafts' className='ml-2 text-body-small'>
                      {systemConfig.autoSaveDrafts ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className='card'>
            <div className='card-header'>
              <h3 className='card-title flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Notification Settings
              </h3>
            </div>
            <div className='p-6 pt-0'>
              <div className='bg-muted/30 p-6 rounded-lg text-center'>
                <Bell className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground'>Notification settings will be configured here</p>
                <p className='text-body-small text-muted-foreground mt-2'>
                  Email alerts, system notifications, and reminder preferences
                </p>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className='card'>
            <div className='card-header'>
              <h3 className='card-title flex items-center gap-2'>
                <Database className='h-5 w-5' />
                Data & Privacy Settings
              </h3>
            </div>
            <div className='p-6 pt-0'>
              <div className='bg-muted/30 p-6 rounded-lg text-center'>
                <Shield className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground'>Data and privacy settings will be configured here</p>
                <p className='text-body-small text-muted-foreground mt-2'>
                  Data retention policies, privacy controls, and compliance settings
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-h1 font-bold text-foreground mb-2'>
            System Settings
          </h1>
          <p className='text-muted-foreground'>
            Configure application preferences, security settings, and system behavior
          </p>
        </div>
        <div className='flex gap-2'>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleResetSettings}
          >
            <RotateCcw className='h-4 w-4' />
            Reset to Defaults
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            <Save className='h-4 w-4' />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='card'>
        <div className='border-b'>
          <nav className='flex space-x-8 px-6' aria-label='Settings tabs'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-body-small transition-colors',
                  activeTab === tab.key
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
      
      {/* Success Message */}
      {saveSuccess && (
        <div className='fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2'>
          <CheckCircle2 className='h-5 w-5' />
          Settings saved successfully
        </div>
      )}

      {/* Help Notice */}
      <div className='card bg-blue-50'>
        <div className='p-4'>
          <h4 className='font-semibold text-blue-800 mb-2'>Settings Information</h4>
          <div className='text-body-small text-blue-700 space-y-1'>
            <p>• Changes to settings are applied immediately after saving</p>
            <p>• Some settings may require a page refresh or re-login to take effect</p>
            <p>• Default settings can be restored using the "Reset to Defaults" button</p>
            <p>• Contact your system administrator for advanced configuration options</p>
          </div>
        </div>
      </div>
    </div>
  );
}