/**
 * @fileoverview TransactionStore - Comprehensive state management for pawnshop transactions
 * 
 * This store manages the complete lifecycle of pawnshop transactions including:
 * - Transaction workflow states and transitions
 * - Multi-ticket operations (renewals, redemptions, combined)
 * - Payment processing and validation
 * - Staff authentication and dual authorization
 * - Real-time WebSocket updates and session management
 * - Transaction persistence and recovery
 * 
 * The store implements a state machine pattern for transaction workflows,
 * ensuring data consistency and providing clear transition paths between
 * different stages of transaction processing.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  TicketData,
  PaymentData,
  Transaction,
  RenewalTransaction,
  RedemptionTransaction,
  StaffAuthentication,
} from '@/types/business';
import { webSocketService } from '@/services/websocket';
import { transactionService } from '@/services/api';

// Transaction workflow states
type TransactionWorkflowState =
  | 'idle'
  | 'ticket-entry'
  | 'ticket-validation'
  | 'review'
  | 'payment-entry'
  | 'payment-validation'
  | 'staff-auth'
  | 'processing'
  | 'confirmation'
  | 'complete'
  | 'failed'
  | 'cancelled';

// Transaction operation types
type TransactionOperationType =
  | 'renewal'
  | 'redemption'
  | 'lost_report'
  | 'combined';

// Transaction validation result
interface TransactionValidation {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
}

// Transaction calculation result
interface TransactionCalculation {
  totalAmount: number;
  breakdown: Array<{
    ticketNo: string;
    principal: number;
    interest: number;
    penalty: number;
    total: number;
  }>;
  fees: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
}

// Transaction session
interface TransactionSession {
  id: string;
  type: TransactionOperationType;
  startTime: string;
  lastActivity: string;
  state: TransactionWorkflowState;
  data: {
    tickets: TicketData[];
    payment: PaymentData | null;
    staffAuth: StaffAuthentication[];
    validation: TransactionValidation | null;
    calculation: TransactionCalculation | null;
  };
  metadata: {
    userAgent: string;
    ipAddress: string;
    deviceId: string;
  };
}

// Enhanced transaction state interface
interface TransactionState {
  // Current transaction session
  currentSession: TransactionSession | null;

  // Transaction data
  selectedTickets: TicketData[];
  paymentData: PaymentData | null;
  staffAuth: StaffAuthentication[];

  // Transaction workflow
  workflowState: TransactionWorkflowState;
  operationType: TransactionOperationType | null;

  // Validation and calculation
  validation: TransactionValidation | null;
  calculation: TransactionCalculation | null;

  // Transaction history and cache
  recentTransactions: Transaction[];
  transactionCache: Map<string, Transaction>;

  // Real-time updates
  isRealTimeEnabled: boolean;
  pendingUpdates: Array<{
    ticketNo: string;
    updates: Partial<TicketData>;
    timestamp: string;
  }>;

  // UI state
  isProcessing: boolean;
  processingMessage: string;
  currentStep: 'ticket-entry' | 'review' | 'payment' | 'auth' | 'complete';
  errors: Record<string, string>;
  warnings: Record<string, string>;

  // Performance metrics
  performanceMetrics: {
    validationTime: number;
    calculationTime: number;
    processingTime: number;
    totalTime: number;
  };

  // Actions - Session Management
  startSession: (type: TransactionOperationType) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;

  // Actions - Ticket Management
  addTicket: (ticket: TicketData) => void;
  removeTicket: (ticketNo: string) => void;
  clearTickets: () => void;
  updateTicket: (ticketNo: string, updates: Partial<TicketData>) => void;
  validateTickets: () => Promise<void>;
  calculateTotals: () => Promise<void>;

  // Actions - Payment
  setPaymentData: (payment: PaymentData) => void;
  clearPaymentData: () => void;

  // Actions - Staff Auth
  addStaffAuth: (auth: StaffAuthentication) => void;
  removeStaffAuth: (staffCode: string) => void;
  clearStaffAuth: () => void;

  // Actions - Workflow Management
  setWorkflowState: (state: TransactionWorkflowState) => void;
  proceedToNextStep: () => Promise<void>;
  goToPreviousStep: () => void;

  // Actions - Transaction Flow
  setCurrentStep: (step: TransactionState['currentStep']) => void;
  setProcessing: (processing: boolean, message?: string) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setWarning: (field: string, warning: string) => void;
  clearWarning: (field: string) => void;
  clearAllWarnings: () => void;

  // Actions - Transaction History
  addTransaction: (transaction: Transaction) => void;
  clearTransactionHistory: () => void;
  cacheTransaction: (transaction: Transaction) => void;
  getCachedTransaction: (transactionId: string) => Transaction | null;

  // Actions - Real-time Updates
  enableRealTimeUpdates: () => void;
  disableRealTimeUpdates: () => void;
  applyTicketUpdate: (ticketNo: string, updates: Partial<TicketData>) => void;

  // Actions - Process Transactions
  processRenewal: () => Promise<void>;
  processRedemption: () => Promise<void>;
  processLostReport: () => Promise<void>;
  processCombined: () => Promise<void>;

  // Actions - Reset
  resetTransaction: () => void;
  resetSession: () => void;

  // Getters
  getTotalAmount: () => number;
  getTicketByNumber: (ticketNo: string) => TicketData | undefined;
  isPaymentValid: () => boolean;
  hasRequiredAuth: (operationType?: TransactionOperationType) => boolean;
  canProceedToNextStep: () => boolean;
  getWorkflowProgress: () => number;
  getSessionDuration: () => number;
  hasActiveSession: () => boolean;
  getValidationSummary: () => { errors: number; warnings: number };
  getCalculationSummary: () => TransactionCalculation | null;
}

// Generate session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create initial session
const createInitialSession = (
  type: TransactionOperationType
): TransactionSession => ({
  id: generateSessionId(),
  type,
  startTime: new Date().toISOString(),
  lastActivity: new Date().toISOString(),
  state: 'ticket-entry',
  data: {
    tickets: [],
    payment: null,
    staffAuth: [],
    validation: null,
    calculation: null,
  },
  metadata: {
    userAgent: navigator.userAgent,
    ipAddress: 'unknown', // Would be set by backend
    deviceId: localStorage.getItem('deviceId') || 'unknown',
  },
});

export const useTransactionStore = create<TransactionState>()(
  persist(
    devtools(
      (set, get) => ({
        // Initial state
        currentSession: null,
        selectedTickets: [],
        paymentData: null,
        staffAuth: [],
        workflowState: 'idle',
        operationType: null,
        validation: null,
        calculation: null,
        recentTransactions: [],
        transactionCache: new Map(),
        isRealTimeEnabled: false,
        pendingUpdates: [],
        isProcessing: false,
        processingMessage: '',
        currentStep: 'ticket-entry',
        errors: {},
        warnings: {},
        performanceMetrics: {
          validationTime: 0,
          calculationTime: 0,
          processingTime: 0,
          totalTime: 0,
        },

        // Session Management Actions
        startSession: type => {
          const session = createInitialSession(type);
          set({
            currentSession: session,
            operationType: type,
            workflowState: 'ticket-entry',
            selectedTickets: [],
            paymentData: null,
            staffAuth: [],
            validation: null,
            calculation: null,
            errors: {},
            warnings: {},
            isProcessing: false,
            processingMessage: '',
          });
        },

        endSession: () => {
          set({
            currentSession: null,
            operationType: null,
            workflowState: 'idle',
            selectedTickets: [],
            paymentData: null,
            staffAuth: [],
            validation: null,
            calculation: null,
            errors: {},
            warnings: {},
            isProcessing: false,
            processingMessage: '',
          });
        },

        pauseSession: () => {
          const state = get();
          if (state.currentSession) {
            set({
              currentSession: {
                ...state.currentSession,
                state: 'idle',
                lastActivity: new Date().toISOString(),
              },
            });
          }
        },

        resumeSession: () => {
          const state = get();
          if (state.currentSession) {
            set({
              currentSession: {
                ...state.currentSession,
                state: state.workflowState,
                lastActivity: new Date().toISOString(),
              },
            });
          }
        },

        // Ticket Management Actions
        addTicket: ticket => {
          set(state => {
            // Prevent duplicates
            const exists = state.selectedTickets.some(
              t => t.ticketNo === ticket.ticketNo
            );
            if (exists) return state;

            const newTickets = [...state.selectedTickets, ticket];
            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    tickets: newTickets,
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              selectedTickets: newTickets,
              currentSession: updatedSession,
            };
          });
        },

        validateTickets: async () => {
          const state = get();
          if (state.selectedTickets.length === 0) return;

          set({
            isProcessing: true,
            processingMessage: 'Validating tickets...',
          });

          try {
            const startTime = performance.now();
            const validationRequest: any = {
              type: state.operationType!,
              tickets: state.selectedTickets.map(t => t.ticketNo),
            };

            if (state.paymentData) {
              validationRequest.payment = {
                cashAmount: state.paymentData.cashAmount || 0,
                digitalAmount: state.paymentData.digitalAmount || 0,
              };
            }

            const validation =
              await transactionService.validateTransaction(validationRequest);

            const validationTime = performance.now() - startTime;

            set({
              validation: {
                isValid: validation.valid,
                errors: validation.errors,
                warnings: validation.warnings,
              },
              performanceMetrics: {
                ...state.performanceMetrics,
                validationTime,
              },
              isProcessing: false,
              processingMessage: '',
            });
          } catch (error) {
            set({
              errors: {
                validation:
                  error instanceof Error ? error.message : 'Validation failed',
              },
              isProcessing: false,
              processingMessage: '',
            });
          }
        },

        calculateTotals: async () => {
          const state = get();
          if (state.selectedTickets.length === 0) return;

          set({
            isProcessing: true,
            processingMessage: 'Calculating totals...',
          });

          try {
            const startTime = performance.now();
            const calculation =
              await transactionService.calculateTransactionTotals({
                type: state.operationType!,
                tickets: state.selectedTickets.map(t => t.ticketNo),
              });

            const calculationTime = performance.now() - startTime;

            set({
              calculation,
              performanceMetrics: {
                ...state.performanceMetrics,
                calculationTime,
              },
              isProcessing: false,
              processingMessage: '',
            });
          } catch (error) {
            set({
              errors: {
                calculation:
                  error instanceof Error ? error.message : 'Calculation failed',
              },
              isProcessing: false,
              processingMessage: '',
            });
          }
        },

        removeTicket: ticketNo => {
          set(state => {
            const newTickets = state.selectedTickets.filter(
              t => t.ticketNo !== ticketNo
            );
            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    tickets: newTickets,
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              selectedTickets: newTickets,
              currentSession: updatedSession,
            };
          });
        },

        clearTickets: () => {
          set(state => {
            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    tickets: [],
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              selectedTickets: [],
              currentSession: updatedSession,
            };
          });
        },

        updateTicket: (ticketNo, updates) => {
          set(state => {
            const newTickets = state.selectedTickets.map(ticket =>
              ticket.ticketNo === ticketNo ? { ...ticket, ...updates } : ticket
            );
            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    tickets: newTickets,
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              selectedTickets: newTickets,
              currentSession: updatedSession,
            };
          });
        },

        // Payment Actions
        setPaymentData: payment => {
          set(state => {
            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    payment,
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              paymentData: payment,
              currentSession: updatedSession,
            };
          });
        },

        clearPaymentData: () => {
          set(state => {
            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    payment: null,
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              paymentData: null,
              currentSession: updatedSession,
            };
          });
        },

        // Staff Auth Actions
        addStaffAuth: auth => {
          set(state => {
            // Prevent duplicate staff codes
            const exists = state.staffAuth.some(
              a => a.staffCode === auth.staffCode
            );
            let newStaffAuth;

            if (exists) {
              newStaffAuth = state.staffAuth.map(a =>
                a.staffCode === auth.staffCode ? auth : a
              );
            } else {
              newStaffAuth = [...state.staffAuth, auth];
            }

            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    staffAuth: newStaffAuth,
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              staffAuth: newStaffAuth,
              currentSession: updatedSession,
            };
          });
        },

        removeStaffAuth: staffCode => {
          set(state => {
            const newStaffAuth = state.staffAuth.filter(
              a => a.staffCode !== staffCode
            );
            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    staffAuth: newStaffAuth,
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              staffAuth: newStaffAuth,
              currentSession: updatedSession,
            };
          });
        },

        clearStaffAuth: () => {
          set(state => {
            const updatedSession = state.currentSession
              ? {
                  ...state.currentSession,
                  data: {
                    ...state.currentSession.data,
                    staffAuth: [],
                  },
                  lastActivity: new Date().toISOString(),
                }
              : null;

            return {
              staffAuth: [],
              currentSession: updatedSession,
            };
          });
        },

        // Workflow Management Actions
        setWorkflowState: state => {
          set({ workflowState: state });
        },

        proceedToNextStep: async () => {
          const state = get();

          switch (state.workflowState) {
            case 'ticket-entry':
              if (state.selectedTickets.length > 0) {
                set({ workflowState: 'ticket-validation' });
                await get().validateTickets();
                if (get().validation?.isValid) {
                  set({ workflowState: 'review' });
                }
              }
              break;
            case 'review':
              set({ workflowState: 'payment-entry' });
              break;
            case 'payment-entry':
              if (state.paymentData) {
                set({ workflowState: 'payment-validation' });
                await get().calculateTotals();
                if (get().calculation) {
                  set({ workflowState: 'staff-auth' });
                }
              }
              break;
            case 'staff-auth':
              if (state.staffAuth.length > 0) {
                set({ workflowState: 'processing' });
                // Process transaction based on type
                switch (state.operationType) {
                  case 'renewal':
                    await get().processRenewal();
                    break;
                  case 'redemption':
                    await get().processRedemption();
                    break;
                  case 'lost_report':
                    await get().processLostReport();
                    break;
                  case 'combined':
                    await get().processCombined();
                    break;
                }
              }
              break;
            case 'processing':
              set({ workflowState: 'confirmation' });
              break;
            case 'confirmation':
              set({ workflowState: 'complete' });
              break;
          }
        },

        goToPreviousStep: () => {
          const state = get();

          switch (state.workflowState) {
            case 'ticket-validation':
            case 'review':
              set({ workflowState: 'ticket-entry' });
              break;
            case 'payment-entry':
              set({ workflowState: 'review' });
              break;
            case 'payment-validation':
            case 'staff-auth':
              set({ workflowState: 'payment-entry' });
              break;
            case 'processing':
              set({ workflowState: 'staff-auth' });
              break;
            case 'confirmation':
              set({ workflowState: 'processing' });
              break;
          }
        },

        // Transaction Flow Actions
        setCurrentStep: step => {
          set({ currentStep: step });
        },

        setProcessing: (processing, message = '') => {
          set({ isProcessing: processing, processingMessage: message });
        },

        setError: (field, error) => {
          set(state => ({
            errors: { ...state.errors, [field]: error },
          }));
        },

        clearError: field => {
          set(state => {
            const { [field]: _, ...rest } = state.errors;
            return { errors: rest };
          });
        },

        clearAllErrors: () => {
          set({ errors: {} });
        },

        setWarning: (field, warning) => {
          set(state => ({
            warnings: { ...state.warnings, [field]: warning },
          }));
        },

        clearWarning: field => {
          set(state => {
            const { [field]: _, ...rest } = state.warnings;
            return { warnings: rest };
          });
        },

        clearAllWarnings: () => {
          set({ warnings: {} });
        },

        // Transaction History Actions
        addTransaction: transaction => {
          set(state => ({
            recentTransactions: [
              transaction,
              ...state.recentTransactions,
            ].slice(0, 10), // Keep last 10
          }));
        },

        clearTransactionHistory: () => {
          set({ recentTransactions: [] });
        },

        cacheTransaction: transaction => {
          set(state => {
            const newCache = new Map(state.transactionCache);
            newCache.set(transaction.id, transaction);
            return { transactionCache: newCache };
          });
        },

        getCachedTransaction: transactionId => {
          const state = get();
          return state.transactionCache.get(transactionId) || null;
        },

        // Real-time Updates Actions
        enableRealTimeUpdates: () => {
          set({ isRealTimeEnabled: true });

          // Subscribe to WebSocket events
          webSocketService.on('ticket_update', (data: any) => {
            const { ticketNo, updates } = data as {
              ticketNo: string;
              updates: any;
            };
            get().applyTicketUpdate(ticketNo, updates);
          });

          webSocketService.on('transaction_completed', (data: any) => {
            const { transactionId } = data as { transactionId: string };
            // Handle transaction completion
            if (get().currentSession?.id === transactionId) {
              set({ workflowState: 'complete' });
            }
          });
        },

        disableRealTimeUpdates: () => {
          set({ isRealTimeEnabled: false });
          webSocketService.off('ticket_update');
          webSocketService.off('transaction_completed');
        },

        applyTicketUpdate: (ticketNo, updates) => {
          set(state => {
            const existingTicket = state.selectedTickets.find(
              t => t.ticketNo === ticketNo
            );
            if (existingTicket) {
              const updatedTickets = state.selectedTickets.map(ticket =>
                ticket.ticketNo === ticketNo
                  ? { ...ticket, ...updates }
                  : ticket
              );

              return {
                selectedTickets: updatedTickets,
                pendingUpdates: [
                  ...state.pendingUpdates,
                  { ticketNo, updates, timestamp: new Date().toISOString() },
                ].slice(-20), // Keep last 20 updates
              };
            }

            return state;
          });
        },

        // Process Transactions
        processRenewal: async () => {
          const state = get();
          if (!state.paymentData || !state.staffAuth.length) return;

          set({
            isProcessing: true,
            processingMessage: 'Processing renewal...',
          });

          try {
            const startTime = performance.now();
            const result = await transactionService.processRenewal({
              tickets: state.selectedTickets.map(t => t.ticketNo),
              payment: {
                cashAmount: state.paymentData?.cashAmount || 0,
                digitalAmount: state.paymentData?.digitalAmount || 0,
                referenceNo: state.paymentData?.referenceNo || undefined,
              },
              staffAuth: {
                staffCode: state.staffAuth[0]?.staffCode || '',
                pin: state.staffAuth[0]?.pin || '',
              },
            });

            const processingTime = performance.now() - startTime;

            set({
              workflowState: 'complete',
              performanceMetrics: {
                ...state.performanceMetrics,
                processingTime,
                totalTime:
                  state.performanceMetrics.validationTime +
                  state.performanceMetrics.calculationTime +
                  processingTime,
              },
              isProcessing: false,
              processingMessage: '',
            });

            // Add to recent transactions
            get().addTransaction({
              id: result.transactionId,
              type: 'renewal',
              ticketNo: state.selectedTickets[0]?.ticketNo || '',
              customerId: state.selectedTickets[0]?.customerId || '',
              staffId: state.staffAuth[0]?.staffInfo?.id || '',
              transactionDate: new Date().toISOString(),
              status: 'completed',
              createdAt: new Date().toISOString(),
              payment: state.paymentData,
              newTicketNo: result.newTickets?.[0] || '',
              interestAmount: result.totalAmount,
            });
          } catch (error) {
            set({
              workflowState: 'failed',
              errors: {
                processing:
                  error instanceof Error ? error.message : 'Processing failed',
              },
              isProcessing: false,
              processingMessage: '',
            });
          }
        },

        processRedemption: async () => {
          const state = get();
          if (!state.paymentData || !state.staffAuth.length) return;

          // Validate that we have selected tickets
          if (state.selectedTickets.length === 0) {
            console.error('No tickets selected for redemption');
            set({
              isProcessing: false,
              processingMessage: '',
              errors: {
                ...state.errors,
                selection: 'No tickets selected for redemption',
              },
            });
            return;
          }

          set({
            isProcessing: true,
            processingMessage: 'Processing redemption...',
          });

          try {
            const startTime = performance.now();
            const result = await transactionService.processRedemption({
              ticketNo: state.selectedTickets[0]!.ticketNo,
              redeemerType: 'pawner', // Default to pawner
              payment: {
                cashAmount: state.paymentData?.cashAmount || 0,
                digitalAmount: state.paymentData?.digitalAmount || 0,
                referenceNo: state.paymentData?.referenceNo || undefined,
              },
              staffAuth: state.staffAuth.map(auth => ({
                staffCode: auth.staffCode,
                pin: auth.pin,
                role: 'keyin' as const,
              })),
            });

            const processingTime = performance.now() - startTime;

            set({
              workflowState: 'complete',
              performanceMetrics: {
                ...state.performanceMetrics,
                processingTime,
                totalTime:
                  state.performanceMetrics.validationTime +
                  state.performanceMetrics.calculationTime +
                  processingTime,
              },
              isProcessing: false,
              processingMessage: '',
            });

            // Add to recent transactions
            get().addTransaction({
              id: result.transactionId,
              type: 'redemption',
              ticketNo: state.selectedTickets[0]?.ticketNo || '',
              customerId: state.selectedTickets[0]?.customerId || '',
              staffId: state.staffAuth[0]?.staffInfo?.id || '',
              transactionDate: new Date().toISOString(),
              status: 'completed',
              createdAt: new Date().toISOString(),
              redeemerType: 'pawner',
              payment: state.paymentData,
              totalAmount: result.totalAmount,
            });
          } catch (error) {
            set({
              workflowState: 'failed',
              errors: {
                processing:
                  error instanceof Error ? error.message : 'Processing failed',
              },
              isProcessing: false,
              processingMessage: '',
            });
          }
        },

        processLostReport: async () => {
          const state = get();
          if (!state.paymentData || !state.staffAuth.length) return;

          set({
            isProcessing: true,
            processingMessage: 'Processing lost report...',
          });

          try {
            const startTime = performance.now();
            const result = await transactionService.processLostReport({
              tickets: state.selectedTickets.map(t => t.ticketNo),
              payment: {
                cashAmount: state.paymentData?.cashAmount || 0,
                digitalAmount: state.paymentData?.digitalAmount || 0,
                referenceNo: state.paymentData?.referenceNo || undefined,
              },
              staffAuth: {
                staffCode: state.staffAuth[0]?.staffCode || '',
                pin: state.staffAuth[0]?.pin || '',
              },
            });

            const processingTime = performance.now() - startTime;

            set({
              workflowState: 'complete',
              performanceMetrics: {
                ...state.performanceMetrics,
                processingTime,
                totalTime:
                  state.performanceMetrics.validationTime +
                  state.performanceMetrics.calculationTime +
                  processingTime,
              },
              isProcessing: false,
              processingMessage: '',
            });

            // Add to recent transactions
            get().addTransaction({
              id: result.transactionId,
              type: 'lost_report',
              ticketNo: state.selectedTickets[0]?.ticketNo || '',
              customerId: state.selectedTickets[0]?.customerId || '',
              staffId: state.staffAuth[0]?.staffInfo?.id || '',
              transactionDate: new Date().toISOString(),
              status: 'completed',
              createdAt: new Date().toISOString(),
              feeAmount: result.totalAmount,
              receiptNo: result.receipts[0]?.id || '',
              payment: state.paymentData,
            });
          } catch (error) {
            set({
              workflowState: 'failed',
              errors: {
                processing:
                  error instanceof Error ? error.message : 'Processing failed',
              },
              isProcessing: false,
              processingMessage: '',
            });
          }
        },

        processCombined: async () => {
          const state = get();
          if (!state.paymentData || !state.staffAuth.length) return;

          // Validate that we have selected tickets
          if (state.selectedTickets.length === 0) {
            console.error('No tickets selected for combined processing');
            set({
              isProcessing: false,
              processingMessage: '',
              errors: {
                ...state.errors,
                selection: 'No tickets selected for combined processing',
              },
            });
            return;
          }

          set({
            isProcessing: true,
            processingMessage: 'Processing combined transaction...',
          });

          try {
            const startTime = performance.now();

            // Separate tickets by operation type
            const renewalTickets = state.selectedTickets.filter(
              t => t.status === 'U'
            );
            const redemptionTickets = state.selectedTickets.filter(
              t => t.status === 'R'
            );

            const result = await transactionService.processCombined({
              renewals: renewalTickets.map(t => t.ticketNo),
              redemptions: redemptionTickets.map(t => ({
                ticketNo: t.ticketNo,
                redeemerType: 'pawner' as const,
              })),
              payment: {
                cashAmount: state.paymentData?.cashAmount || 0,
                digitalAmount: state.paymentData?.digitalAmount || 0,
                referenceNo: state.paymentData?.referenceNo || undefined,
              },
              staffAuth: state.staffAuth.map(auth => ({
                staffCode: auth.staffCode,
                pin: auth.pin,
              })),
            });

            const processingTime = performance.now() - startTime;
            const transactionDate = new Date().toISOString();
            const baseStaffId = state.staffAuth[0]?.staffInfo?.id || '';

            set({
              workflowState: 'complete',
              performanceMetrics: {
                ...state.performanceMetrics,
                processingTime,
                totalTime:
                  state.performanceMetrics.validationTime +
                  state.performanceMetrics.calculationTime +
                  processingTime,
              },
              isProcessing: false,
              processingMessage: '',
            });

            // Create individual transaction records for each processed ticket
            const addTransaction = get().addTransaction;

            // Add renewal transactions
            renewalTickets.forEach((ticket, index) => {
              const renewalTransaction: RenewalTransaction = {
                id: `${result.transactionId}_renewal_${index}`,
                type: 'renewal',
                ticketNo: ticket.ticketNo,
                customerId: ticket.customerId,
                staffId: baseStaffId,
                transactionDate,
                status: 'completed',
                createdAt: transactionDate,
                payment: {
                  cashAmount: state.paymentData?.cashAmount || 0,
                  digitalAmount: state.paymentData?.digitalAmount || 0,
                  totalCollected:
                    (state.paymentData?.cashAmount || 0) +
                    (state.paymentData?.digitalAmount || 0),
                  referenceNo: state.paymentData?.referenceNo || undefined,
                },
                newTicketNo: result.updatedTickets[index] || ticket.ticketNo,
                interestAmount: ticket.financial?.interest || 0,
              };
              addTransaction(renewalTransaction);
            });

            // Add redemption transactions
            redemptionTickets.forEach((ticket, index) => {
              const redemptionTransaction: RedemptionTransaction = {
                id: `${result.transactionId}_redemption_${index}`,
                type: 'redemption',
                ticketNo: ticket.ticketNo,
                customerId: ticket.customerId,
                staffId: baseStaffId,
                transactionDate,
                status: 'completed',
                createdAt: transactionDate,
                redeemerType: 'pawner',
                payment: {
                  cashAmount: state.paymentData?.cashAmount || 0,
                  digitalAmount: state.paymentData?.digitalAmount || 0,
                  totalCollected:
                    (state.paymentData?.cashAmount || 0) +
                    (state.paymentData?.digitalAmount || 0),
                  referenceNo: state.paymentData?.referenceNo || undefined,
                },
                totalAmount: ticket.financial?.principal || 0,
              };
              addTransaction(redemptionTransaction);
            });
          } catch (error) {
            set({
              workflowState: 'failed',
              errors: {
                processing:
                  error instanceof Error ? error.message : 'Processing failed',
              },
              isProcessing: false,
              processingMessage: '',
            });
          }
        },

        // Reset Actions
        resetTransaction: () => {
          set({
            selectedTickets: [],
            paymentData: null,
            staffAuth: [],
            validation: null,
            calculation: null,
            isProcessing: false,
            processingMessage: '',
            currentStep: 'ticket-entry',
            errors: {},
            warnings: {},
          });
        },

        resetSession: () => {
          set({
            currentSession: null,
            operationType: null,
            workflowState: 'idle',
            selectedTickets: [],
            paymentData: null,
            staffAuth: [],
            validation: null,
            calculation: null,
            isProcessing: false,
            processingMessage: '',
            currentStep: 'ticket-entry',
            errors: {},
            warnings: {},
            performanceMetrics: {
              validationTime: 0,
              calculationTime: 0,
              processingTime: 0,
              totalTime: 0,
            },
          });
        },

        // Getters
        getTotalAmount: () => {
          const state = get();
          if (state.calculation) {
            return state.calculation.totalAmount;
          }

          // Fallback calculation
          return state.selectedTickets.reduce((total, ticket) => {
            return (
              total + ticket.financial.interest + ticket.financial.outstandings
            );
          }, 0);
        },

        getTicketByNumber: ticketNo => {
          const { selectedTickets } = get();
          return selectedTickets.find(t => t.ticketNo === ticketNo);
        },

        isPaymentValid: () => {
          const state = get();
          if (!state.paymentData) return false;

          const totalAmount = state.getTotalAmount();
          return state.paymentData.totalCollected >= totalAmount;
        },

        hasRequiredAuth: operationType => {
          const state = get();
          const opType = operationType || state.operationType;
          if (!opType) return false;

          switch (opType) {
            case 'renewal':
              return state.staffAuth.length >= 1;
            case 'redemption':
              // Check if any ticket has different redeemer - would need dual auth
              return state.staffAuth.length >= 1; // Simplified for now
            case 'lost_report':
              return state.staffAuth.length >= 1;
            case 'combined':
              return state.staffAuth.length >= 1;
            default:
              return false;
          }
        },

        canProceedToNextStep: () => {
          const state = get();
          const hasErrors = Object.keys(state.errors).length > 0;

          if (hasErrors || state.isProcessing) return false;

          switch (state.workflowState) {
            case 'idle':
              return false;
            case 'ticket-entry':
              return state.selectedTickets.length > 0;
            case 'ticket-validation':
              return state.validation?.isValid === true;
            case 'review':
              return true; // Can always proceed from review
            case 'payment-entry':
              return state.paymentData !== null;
            case 'payment-validation':
              return state.calculation !== null;
            case 'staff-auth':
              return state.hasRequiredAuth();
            case 'processing':
              return false; // Processing in progress
            case 'confirmation':
              return true;
            case 'complete':
            case 'failed':
            case 'cancelled':
              return false;
            default:
              return false;
          }
        },

        getWorkflowProgress: () => {
          const state = get();
          const steps = [
            'idle',
            'ticket-entry',
            'ticket-validation',
            'review',
            'payment-entry',
            'payment-validation',
            'staff-auth',
            'processing',
            'confirmation',
            'complete',
          ];

          const currentIndex = steps.indexOf(state.workflowState);
          return currentIndex >= 0
            ? (currentIndex / (steps.length - 1)) * 100
            : 0;
        },

        getSessionDuration: () => {
          const state = get();
          if (!state.currentSession) return 0;

          const startTime = new Date(state.currentSession.startTime).getTime();
          const now = Date.now();
          return Math.round((now - startTime) / 1000); // Return in seconds
        },

        hasActiveSession: () => {
          const state = get();
          return (
            state.currentSession !== null && state.workflowState !== 'idle'
          );
        },

        getValidationSummary: () => {
          const state = get();
          if (!state.validation) {
            return { errors: 0, warnings: 0 };
          }

          return {
            errors: state.validation.errors.length,
            warnings: state.validation.warnings.length,
          };
        },

        getCalculationSummary: () => {
          const state = get();
          return state.calculation;
        },

        // Legacy getters for backward compatibility
        // These maintain the old interface while using the new enhanced state
        // @deprecated - use workflowState instead
        getCurrentStep: () => {
          const state = get();
          return state.currentStep;
        },
      }),
      {
        name: 'transaction-store',
      }
    ),
    {
      name: 'vampire-transaction-storage',
      // Only persist essential data, not the entire state
      partialize: state => ({
        recentTransactions: state.recentTransactions,
        performanceMetrics: state.performanceMetrics,
        // Don't persist session data for security
      }),
      // Clear sensitive data on hydration
      onRehydrateStorage: () => state => {
        if (state) {
          state.currentSession = null;
          state.selectedTickets = [];
          state.paymentData = null;
          state.staffAuth = [];
          state.workflowState = 'idle';
          state.operationType = null;
          state.validation = null;
          state.calculation = null;
          state.isProcessing = false;
          state.processingMessage = '';
          state.errors = {};
          state.warnings = {};
        }
      },
    }
  )
);

// Export workflow state type for external usage
export type {
  TransactionWorkflowState,
  TransactionOperationType,
  TransactionValidation,
  TransactionCalculation,
  TransactionSession,
};
