import { z } from 'zod';

// User Preferences Schema
export const userPreferencesSchema = z.object({
  // Appearance Settings
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: 'Theme selection is required'
  }),
  
  language: z.enum(['en', 'zh', 'ms', 'ta'], {
    required_error: 'Language selection is required'
  }),
  
  // Regional Settings
  dateFormat: z.enum(['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'], {
    required_error: 'Date format is required'
  }),
  
  currencyDisplay: z.enum(['symbol', 'code', 'name'], {
    required_error: 'Currency display format is required'
  }),
  
  // Time and Number Formats
  timeFormat: z.enum(['12', '24']).default('24'),
  numberFormat: z.enum(['1,234.56', '1.234,56', '1 234.56']).default('1,234.56'),
  
  // UI Preferences
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  compactMode: z.boolean().default(false),
  showTooltips: z.boolean().default(true),
  animationsEnabled: z.boolean().default(true)
});

// System Configuration Schema
export const systemConfigurationSchema = z.object({
  // Security Settings
  dualStaffAuth: z.boolean(),
  
  maxLoginAttempts: z
    .number()
    .min(1, 'Minimum 1 login attempt required')
    .max(10, 'Maximum 10 login attempts allowed'),
  
  accountLockoutDuration: z
    .number()
    .min(5, 'Minimum lockout duration is 5 minutes')
    .max(1440, 'Maximum lockout duration is 24 hours'),
  
  passwordExpiryDays: z
    .number()
    .min(30, 'Minimum password expiry is 30 days')
    .max(365, 'Maximum password expiry is 365 days'),
  
  // Session Management
  sessionTimeout: z
    .number()
    .min(5, 'Minimum session timeout is 5 minutes')
    .max(480, 'Maximum session timeout is 8 hours'),
  
  autoLogoutTime: z
    .number()
    .min(10, 'Minimum auto-logout time is 10 minutes')
    .max(720, 'Maximum auto-logout time is 12 hours'),
  
  sessionWarningTime: z
    .number()
    .min(1, 'Minimum warning time is 1 minute')
    .max(60, 'Maximum warning time is 60 minutes'),
  
  // Data Management
  autoSaveDrafts: z.boolean(),
  
  autoSaveInterval: z
    .number()
    .min(30, 'Minimum auto-save interval is 30 seconds')
    .max(600, 'Maximum auto-save interval is 10 minutes'),
  
  draftRetentionDays: z
    .number()
    .min(1, 'Minimum draft retention is 1 day')
    .max(90, 'Maximum draft retention is 90 days'),
  
  // Transaction Limits
  maxDailyTransactions: z
    .number()
    .min(100, 'Minimum daily transaction limit is 100')
    .max(10000, 'Maximum daily transaction limit is 10,000'),
  
  highValueThreshold: z
    .number()
    .min(1000, 'Minimum high-value threshold is $1,000')
    .max(100000, 'Maximum high-value threshold is $100,000'),
  
  managerApprovalThreshold: z
    .number()
    .min(5000, 'Minimum manager approval threshold is $5,000')
    .max(500000, 'Maximum manager approval threshold is $500,000'),
  
  // Backup and Maintenance
  autoBackupEnabled: z.boolean(),
  
  backupFrequency: z.enum(['hourly', 'daily', 'weekly'], {
    required_error: 'Backup frequency is required'
  }),
  
  backupRetentionDays: z
    .number()
    .min(7, 'Minimum backup retention is 7 days')
    .max(365, 'Maximum backup retention is 365 days'),
  
  maintenanceWindowStart: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'),
  
  maintenanceWindowEnd: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'),
  
  // Audit and Compliance
  auditLogRetention: z
    .number()
    .min(90, 'Minimum audit log retention is 90 days')
    .max(2555, 'Maximum audit log retention is 7 years'), // 7 years * 365 days
  
  detailedLogging: z.boolean(),
  
  complianceMode: z.boolean(),
  
  // Performance Settings
  maxConcurrentUsers: z
    .number()
    .min(1, 'Minimum 1 concurrent user')
    .max(1000, 'Maximum 1000 concurrent users'),
  
  queryTimeout: z
    .number()
    .min(10, 'Minimum query timeout is 10 seconds')
    .max(300, 'Maximum query timeout is 5 minutes'),
  
  cacheExpiry: z
    .number()
    .min(60, 'Minimum cache expiry is 1 minute')
    .max(3600, 'Maximum cache expiry is 1 hour')
}).superRefine((data, ctx) => {
  // Custom validations
  
  // Session timeout should be longer than warning time
  if (data.sessionTimeout <= data.sessionWarningTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Session timeout must be longer than warning time',
      path: ['sessionTimeout']
    });
  }
  
  // Auto-logout should be longer than session timeout
  if (data.autoLogoutTime <= data.sessionTimeout) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Auto-logout time must be longer than session timeout',
      path: ['autoLogoutTime']
    });
  }
  
  // High-value threshold should be less than manager approval threshold
  if (data.highValueThreshold >= data.managerApprovalThreshold) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'High-value threshold must be less than manager approval threshold',
      path: ['highValueThreshold']
    });
  }
  
  // Maintenance window validation
  const startTimeParts = data.maintenanceWindowStart.split(':').map(Number);
  const endTimeParts = data.maintenanceWindowEnd.split(':').map(Number);
  const startMinutes = (startTimeParts[0] ?? 0) * 60 + (startTimeParts[1] ?? 0);
  const endMinutes = (endTimeParts[0] ?? 0) * 60 + (endTimeParts[1] ?? 0);
  
  if (startMinutes >= endMinutes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Maintenance window start time must be before end time',
      path: ['maintenanceWindowStart']
    });
  }
  
  // Auto-save validation
  if (data.autoSaveDrafts && data.autoSaveInterval < 30) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Auto-save interval must be at least 30 seconds when enabled',
      path: ['autoSaveInterval']
    });
  }
});

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  // Email Notifications
  emailNotificationsEnabled: z.boolean(),
  emailAddress: z
    .string()
    .email('Invalid email address')
    .optional(),
  
  // Transaction Notifications
  transactionAlerts: z.boolean(),
  highValueAlerts: z.boolean(),
  failedLoginAlerts: z.boolean(),
  systemMaintenanceAlerts: z.boolean(),
  
  // System Notifications
  browserNotificationsEnabled: z.boolean(),
  soundNotificationsEnabled: z.boolean(),
  notificationDuration: z
    .number()
    .min(3, 'Minimum notification duration is 3 seconds')
    .max(30, 'Maximum notification duration is 30 seconds'),
  
  // SMS Notifications
  smsNotificationsEnabled: z.boolean(),
  phoneNumber: z
    .string()
    .regex(/^(\+65\s?)?[6789]\d{7}$/, 'Invalid Singapore phone number')
    .optional(),
  
  // Notification Frequency
  digestFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
    .optional()
}).superRefine((data, ctx) => {
  // Email required if email notifications enabled
  if (data.emailNotificationsEnabled && !data.emailAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Email address is required when email notifications are enabled',
      path: ['emailAddress']
    });
  }
  
  // Phone required if SMS notifications enabled
  if (data.smsNotificationsEnabled && !data.phoneNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Phone number is required when SMS notifications are enabled',
      path: ['phoneNumber']
    });
  }
  
  // Quiet hours validation
  if (data.quietHoursEnabled) {
    if (!data.quietHoursStart || !data.quietHoursEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Quiet hours start and end times are required',
        path: ['quietHoursStart']
      });
    }
  }
});

// Data & Privacy Schema
export const dataPrivacySchema = z.object({
  // Data Retention
  customerDataRetention: z
    .number()
    .min(365, 'Minimum customer data retention is 1 year')
    .max(3653, 'Maximum customer data retention is 10 years'), // 10 years * 365 + 3 leap days
  
  transactionDataRetention: z
    .number()
    .min(2555, 'Minimum transaction data retention is 7 years') // Legal requirement
    .max(3653, 'Maximum transaction data retention is 10 years'),
  
  auditTrailRetention: z
    .number()
    .min(2555, 'Minimum audit trail retention is 7 years')
    .max(3653, 'Maximum audit trail retention is 10 years'),
  
  // Privacy Settings
  dataSharingEnabled: z.boolean(),
  analyticsEnabled: z.boolean(),
  crashReportingEnabled: z.boolean(),
  
  // Data Export
  allowDataExport: z.boolean(),
  exportFormat: z.enum(['json', 'csv', 'pdf']),
  exportEncryption: z.boolean(),
  
  // Data Deletion
  allowDataDeletion: z.boolean(),
  deletionApprovalRequired: z.boolean(),
  deletionRetentionDays: z
    .number()
    .min(30, 'Minimum deletion retention is 30 days')
    .max(365, 'Maximum deletion retention is 365 days'),
  
  // Compliance
  gdprCompliance: z.boolean(),
  pdpaCompliance: z.boolean(),
  dataProcessingLawful: z.boolean(),
  
  // Data Minimization
  minimizeDataCollection: z.boolean(),
  automaticDataCleanup: z.boolean(),
  dataQualityChecks: z.boolean()
});

// Combined Settings Schema
export const systemSettingsSchema = z.object({
  userPreferences: userPreferencesSchema,
  systemConfiguration: systemConfigurationSchema,
  notificationSettings: notificationSettingsSchema,
  dataPrivacy: dataPrivacySchema,
  
  // Metadata
  lastUpdated: z.string().optional(),
  updatedBy: z.string().optional(),
  version: z.string().optional()
});

// Type exports
export type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;
export type UserPreferencesData = z.infer<typeof userPreferencesSchema>;
export type SystemConfigurationData = z.infer<typeof systemConfigurationSchema>;
export type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;
export type DataPrivacyData = z.infer<typeof dataPrivacySchema>;

// Helper functions
export const getDefaultSettings = (): SystemSettingsFormData => {
  return {
    userPreferences: {
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
    },
    systemConfiguration: {
      dualStaffAuth: true,
      maxLoginAttempts: 3,
      accountLockoutDuration: 30,
      passwordExpiryDays: 90,
      sessionTimeout: 30,
      autoLogoutTime: 60,
      sessionWarningTime: 5,
      autoSaveDrafts: true,
      autoSaveInterval: 60,
      draftRetentionDays: 7,
      maxDailyTransactions: 1000,
      highValueThreshold: 5000,
      managerApprovalThreshold: 10000,
      autoBackupEnabled: true,
      backupFrequency: 'daily',
      backupRetentionDays: 30,
      maintenanceWindowStart: '02:00',
      maintenanceWindowEnd: '04:00',
      auditLogRetention: 2555,
      detailedLogging: true,
      complianceMode: true,
      maxConcurrentUsers: 50,
      queryTimeout: 30,
      cacheExpiry: 300
    },
    notificationSettings: {
      emailNotificationsEnabled: true,
      transactionAlerts: true,
      highValueAlerts: true,
      failedLoginAlerts: true,
      systemMaintenanceAlerts: true,
      browserNotificationsEnabled: true,
      soundNotificationsEnabled: false,
      notificationDuration: 5,
      smsNotificationsEnabled: false,
      digestFrequency: 'immediate',
      quietHoursEnabled: false
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
};

export const validateTimeRange = (start: string, end: string): boolean => {
  const startTimeParts = start.split(':').map(Number);
  const endTimeParts = end.split(':').map(Number);
  const startMinutes = (startTimeParts[0] ?? 0) * 60 + (startTimeParts[1] ?? 0);
  const endMinutes = (endTimeParts[0] ?? 0) * 60 + (endTimeParts[1] ?? 0);
  return startMinutes < endMinutes;
};

export const formatTime = (time: string): string => {
  const parts = time.split(':').map(Number);
  const hours = parts[0];
  const minutes = parts[1];
  if (hours === undefined || minutes === undefined) return time;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};