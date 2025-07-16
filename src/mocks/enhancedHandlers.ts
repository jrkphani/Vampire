import { http, HttpResponse } from 'msw';
import type {
  TicketData,
  StaffInfo,
  Customer,
  Transaction,
} from '@/types/business';
import { TicketStatus } from '@/types/business';

// Mock data generator utilities
const generateTicketNo = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const sequence = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `B/${month}${year}/${sequence}`;
};

// Generate today's date in ISO format for consistent mock data
const getTodayISO = () => new Date().toISOString();
const getYesterdayISO = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString();
};

const generateCustomerId = () => {
  return `CUST${Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0')}`;
};

const generateTransactionId = () => {
  return `TXN${Date.now()}`;
};

// Mock staff data
const mockStaffMembers: StaffInfo[] = [
  {
    id: '1',
    code: 'SC001',
    name: 'Sarah Chen',
    role: 'Senior Staff',
    permissions: ['renewal', 'redemption', 'enquiry', 'lost_report', 'admin'],
  },
  {
    id: '2',
    code: 'SC002',
    name: 'Michael Wong',
    role: 'Staff',
    permissions: ['renewal', 'redemption', 'enquiry'],
  },
  {
    id: '3',
    code: 'SC003',
    name: 'Lisa Tan',
    role: 'Appraiser',
    permissions: ['renewal', 'redemption', 'enquiry', 'appraisal'],
  },
];

// Mock customers data
const mockCustomers: Customer[] = [
  {
    id: 'CUST001',
    nric: 'S1234567A',
    name: 'John Tan Wei Ming',
    dob: '1980-05-15',
    gender: 'M',
    nationality: 'Singapore',
    race: 'Chinese',
    address: '123 Orchard Road',
    postalCode: '238823',
    contact: '91234567',
    email: 'john.tan@email.com',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'CUST002',
    nric: 'S2345678B',
    name: 'Mary Lim Hui Ling',
    dob: '1985-08-22',
    gender: 'F',
    nationality: 'Singapore',
    race: 'Chinese',
    address: '456 Marina Bay',
    postalCode: '018956',
    contact: '92345678',
    email: 'mary.lim@email.com',
    createdAt: '2024-02-10T14:20:00Z',
    updatedAt: '2024-02-10T14:20:00Z',
  },
  {
    id: 'CUST003',
    nric: 'S3456789C',
    name: 'Ahmed Rahman',
    dob: '1978-12-03',
    gender: 'M',
    nationality: 'Singapore',
    race: 'Malay',
    address: '789 Clementi Road',
    postalCode: '129834',
    contact: '93456789',
    createdAt: '2024-03-05T09:15:00Z',
    updatedAt: '2024-03-05T09:15:00Z',
  },
  {
    id: 'CUST004',
    nric: 'S4567890D',
    name: 'David Lee Kah Wai',
    dob: '1992-11-01',
    gender: 'M',
    nationality: 'Singapore',
    race: 'Chinese',
    address: '10 Jurong East Street 32',
    postalCode: '609505',
    contact: '94567890',
    email: 'david.lee@email.com',
    createdAt: '2024-04-01T08:00:00Z',
    updatedAt: '2024-04-01T08:00:00Z',
  },
  {
    id: 'CUST005',
    nric: 'S5678901E',
    name: 'Priya Sharma',
    dob: '1988-03-20',
    gender: 'F',
    nationality: 'Singapore',
    race: 'Indian',
    address: '25 Serangoon Road',
    postalCode: '218227',
    contact: '95678901',
    email: 'priya.sharma@email.com',
    createdAt: '2024-05-10T11:30:00Z',
    updatedAt: '2024-05-10T11:30:00Z',
  },
  {
    id: 'CUST006',
    nric: 'S6789012F',
    name: 'Michael Wong Jin Kai',
    dob: '1975-09-12',
    gender: 'M',
    nationality: 'Singapore',
    race: 'Chinese',
    address: '88 Ang Mo Kio Avenue 4',
    postalCode: '569897',
    contact: '96789012',
    email: 'michael.wong@email.com',
    createdAt: '2024-06-15T16:45:00Z',
    updatedAt: '2024-06-15T16:45:00Z',
  },
];

// Mock tickets data
const mockTickets: TicketData[] = [
  {
    ticketNo: 'B/0725/1234',
    pledgeNo: 'PL001234',
    customerId: 'CUST001',
    customer: {
      id: 'CUST001',
      nric: 'S1234567A',
      name: 'John Tan Wei Ming',
      contact: '91234567',
    },
    pledge: {
      pledgeNo: 'PL001234',
      weight: '15.2g',
      description: 'Gold chain with pendant',
      scrambledNo: 'SCR123',
      pledgeCode: 'PC001',
      stCode: 'ST001',
      pCode: 'P001',
    },
    financial: {
      principal: 800,
      interest: 24,
      months: 3,
      newAmount: 824,
      outstandings: 0,
      interestRate: 3.0,
    },
    dates: {
      pawnDate: '2024-04-25',
      expiryDate: '2024-07-25',
      maturityDate: '2024-10-25',
    },
    status: TicketStatus.U,
    createdAt: '2024-04-25T10:30:00Z',
    updatedAt: '2024-04-25T10:30:00Z',
  },
  {
    ticketNo: 'B/0725/1235',
    pledgeNo: 'PL001235',
    customerId: 'CUST002',
    customer: {
      id: 'CUST002',
      nric: 'S2345678B',
      name: 'Mary Lim Hui Ling',
      contact: '92345678',
    },
    pledge: {
      pledgeNo: 'PL001235',
      weight: '8.5g',
      description: 'Gold ring set',
      scrambledNo: 'SCR124',
      pledgeCode: 'PC002',
      stCode: 'ST002',
      pCode: 'P002',
    },
    financial: {
      principal: 450,
      interest: 13.5,
      months: 2,
      newAmount: 463.5,
      outstandings: 0,
      interestRate: 3.0,
    },
    dates: {
      pawnDate: '2024-05-15',
      expiryDate: '2024-08-15',
      maturityDate: '2024-11-15',
    },
    status: TicketStatus.U,
    createdAt: '2024-05-15T14:20:00Z',
    updatedAt: '2024-05-15T14:20:00Z',
  },
  {
    ticketNo: 'B/0625/0998',
    pledgeNo: 'PL000998',
    customerId: 'CUST003',
    customer: {
      id: 'CUST003',
      nric: 'S3456789C',
      name: 'Ahmed Rahman',
      contact: '93456789',
    },
    pledge: {
      pledgeNo: 'PL000998',
      weight: '22.1g',
      description: 'Gold bracelet',
      scrambledNo: 'SCR125',
      pledgeCode: 'PC003',
      stCode: 'ST003',
      pCode: 'P003',
    },
    financial: {
      principal: 1200,
      interest: 108,
      months: 6,
      newAmount: 1308,
      outstandings: 0,
      interestRate: 3.0,
    },
    dates: {
      pawnDate: '2024-03-25',
      expiryDate: '2024-06-25',
      maturityDate: '2024-09-25',
    },
    status: TicketStatus.R,
    createdAt: '2024-03-25T11:45:00Z',
    updatedAt: '2024-06-25T16:30:00Z',
  },
  {
    ticketNo: 'B/0124/0089',
    pledgeNo: 'PL000089',
    customerId: 'CUST003',
    customer: {
      id: 'CUST003',
      nric: 'S3456789C',
      name: 'David Wong Kah Wai',
      contact: '93456789',
    },
    pledge: {
      pledgeNo: 'PL000089',
      weight: '12.0g',
      description: 'Gold bracelet',
      scrambledNo: 'SCR089',
      pledgeCode: 'PC089',
      stCode: 'ST089',
      pCode: 'P089',
    },
    financial: {
      principal: 500,
      interest: 45,
      months: 3,
      newAmount: 545,
      outstandings: 0,
      interestRate: 3.0,
    },
    dates: {
      pawnDate: '2024-01-08',
      expiryDate: '2024-04-08',
      maturityDate: '2024-07-08',
    },
    status: TicketStatus.R,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-04-08T14:30:00Z',
  },
];

// Mock transactions data
const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    type: 'renewal',
    ticketNo: 'B/0725/1234',
    customerId: 'CUST001',
    staffId: '1',
    transactionDate: getTodayISO().split('T')[0] + 'T10:30:00Z',
    status: 'completed',
    createdAt: getTodayISO().split('T')[0] + 'T10:30:00Z',
    payment: {
      cashAmount: 24,
      digitalAmount: 0,
      totalCollected: 24,
    },
    newTicketNo: 'B/1025/1234',
    interestAmount: 24,
  },
  {
    id: 'TXN002',
    type: 'redemption',
    ticketNo: 'B/0625/0998',
    customerId: 'CUST003',
    staffId: '2',
    transactionDate: getTodayISO().split('T')[0] + 'T09:15:00Z',
    status: 'completed',
    createdAt: getTodayISO().split('T')[0] + 'T09:15:00Z',
    payment: {
      cashAmount: 1200,
      digitalAmount: 108,
      totalCollected: 1308,
    },
    totalAmount: 1308,
    redeemerType: 'pawner',
  },
  {
    id: 'TXN003',
    type: 'renewal',
    ticketNo: 'B/0725/1235',
    customerId: 'CUST002',
    staffId: '3',
    transactionDate: getTodayISO().split('T')[0] + 'T08:45:00Z',
    status: 'completed',
    createdAt: getTodayISO().split('T')[0] + 'T08:45:00Z',
    payment: {
      cashAmount: 13.5,
      digitalAmount: 0,
      totalCollected: 13.5,
    },
    newTicketNo: 'B/1025/1235',
    interestAmount: 13.5,
  },
  {
    id: 'TXN004',
    type: 'lost_report',
    ticketNo: 'B/0625/0777',
    customerId: 'CUST001',
    staffId: '1',
    transactionDate: getYesterdayISO().split('T')[0] + 'T16:20:00Z',
    status: 'completed',
    createdAt: getYesterdayISO().split('T')[0] + 'T16:20:00Z',
    payment: {
      cashAmount: 50,
      digitalAmount: 0,
      totalCollected: 50,
    },
    feeAmount: 50,
    receiptNo: 'LLR0001',
  },
  {
    id: 'TXN005',
    type: 'renewal',
    ticketNo: 'B/0624/0555',
    customerId: 'CUST002',
    staffId: '2',
    transactionDate: getYesterdayISO().split('T')[0] + 'T14:10:00Z',
    status: 'completed',
    createdAt: getYesterdayISO().split('T')[0] + 'T14:10:00Z',
    payment: {
      cashAmount: 28,
      digitalAmount: 0,
      totalCollected: 28,
    },
    newTicketNo: 'B/1024/0555',
    interestAmount: 28,
  },
  {
    id: 'TXN006',
    type: 'redemption',
    ticketNo: 'B/0524/0333',
    customerId: 'CUST003',
    staffId: '3',
    transactionDate: getYesterdayISO().split('T')[0] + 'T11:30:00Z',
    status: 'completed',
    createdAt: getYesterdayISO().split('T')[0] + 'T11:30:00Z',
    payment: {
      cashAmount: 850,
      digitalAmount: 65,
      totalCollected: 915,
    },
    totalAmount: 915,
    redeemerType: 'pawner',
  },
];

// Network delay simulation
const simulateNetworkDelay = (min = 100, max = 1000) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Error simulation
const simulateError = (probability = 0.1) => {
  return Math.random() < probability;
};

// Response scenarios for testing
const responseScenarios = {
  normal: 0.95,
  slow: 0.04,
  error: 0.01,
};

const getResponseScenario = () => {
  const random = Math.random();
  if (random < responseScenarios.error) return 'error';
  if (random < responseScenarios.error + responseScenarios.slow) return 'slow';
  return 'normal';
};

// Additional mock data for enhanced functionality
const mockLostPledgeReports = [
  {
    id: 'LPR001',
    ticketNos: ['B/0725/1234'],
    reporterName: 'John Tan Wei Ming',
    reporterNric: 'S1234567A',
    circumstances: 'stolen',
    policeReportNumber: 'POL202407001',
    status: 'approved',
    submittedAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 'LPR002',
    ticketNos: ['B/0625/0998'],
    reporterName: 'Ahmed Rahman',
    reporterNric: 'S3456789C',
    circumstances: 'lost',
    status: 'under_review',
    submittedAt: '2024-07-10T14:30:00Z',
  },
];

const mockDocuments = [
  {
    id: 'DOC001',
    type: 'receipt',
    transactionId: 'TXN001',
    filePath: '/receipts/renewal-TXN001.pdf',
    printStatus: 'printed',
    createdAt: '2024-07-10T10:30:00Z',
  },
  {
    id: 'LLR001',
    type: 'lost_letter',
    transactionId: 'LPR001',
    filePath: '/receipts/lost-letter-LPR001.pdf',
    printStatus: 'printed',
    createdAt: '2024-07-01T11:00:00Z',
  },
];

// Find mock data helpers
const findMockStaff = (code: string) =>
  mockStaffMembers.find(staff => staff.code === code);
const findMockCustomer = (id: string) =>
  mockCustomers.find(customer => customer.id === id);
const findMockCustomerByNric = (nric: string) =>
  mockCustomers.find(customer => customer.nric === nric);
const findMockTicket = (ticketNo: string) =>
  mockTickets.find(ticket => ticket.ticketNo === ticketNo);

export const enhancedHandlers = [
  // Authentication endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const scenario = getResponseScenario();

    if (scenario === 'error') {
      return HttpResponse.json(
        {
          success: false,
          error: 'Service temporarily unavailable',
        },
        { status: 503 }
      );
    }

    if (scenario === 'slow') {
      await simulateNetworkDelay(2000, 5000);
    } else {
      await simulateNetworkDelay(200, 800);
    }

    const body = (await request.json()) as { staffCode: string; pin: string };

    // Find staff member
    const staff = findMockStaff(body.staffCode);

    if (staff && body.pin === '1234') {
      return HttpResponse.json({
        success: true,
        data: {
          token: `mock-jwt-token-${Date.now()}`,
          refreshToken: `mock-refresh-token-${Date.now()}`,
          staff,
          expiresIn: 28800,
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: 'Invalid credentials',
      },
      { status: 401 }
    );
  }),

  http.post('/api/auth/validate', async ({ request }) => {
    await simulateNetworkDelay(100, 300);

    const body = (await request.json()) as { staffCode: string; pin: string };
    const staff = findMockStaff(body.staffCode);

    return HttpResponse.json({
      success: true,
      data: {
        valid: staff !== undefined && body.pin === '1234',
      },
    });
  }),

  http.get('/api/auth/profile', async () => {
    await simulateNetworkDelay(100, 300);

    return HttpResponse.json({
      success: true,
      data: mockStaffMembers[0],
    });
  }),

  http.post('/api/auth/refresh', async () => {
    await simulateNetworkDelay(200, 500);

    return HttpResponse.json({
      success: true,
      data: {
        token: `new-mock-jwt-token-${Date.now()}`,
        expiresIn: 28800,
      },
    });
  }),

  // Ticket endpoints
  http.get('/api/tickets/search', async ({ request }) => {
    console.log('🎫 Mock: Handling GET /api/tickets/search', request.url);
    await simulateNetworkDelay(400, 1000);

    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Default to all tickets when no query is provided
    let filteredTickets = mockTickets;

    if (query) {
      filteredTickets = mockTickets.filter(
        ticket =>
          ticket.ticketNo.toLowerCase().includes(query.toLowerCase()) ||
          ticket.customer.name.toLowerCase().includes(query.toLowerCase()) ||
          ticket.customer.nric.toLowerCase().includes(query.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedTickets,
        pagination: {
          page,
          limit,
          total: filteredTickets.length,
          totalPages: Math.ceil(filteredTickets.length / limit),
          hasNext: endIndex < filteredTickets.length,
          hasPrev: page > 1,
        },
      },
    });
  }),

  http.get('/api/tickets/:ticketNo', async ({ params }) => {
    const scenario = getResponseScenario();
    const { ticketNo } = params;

    if (scenario === 'error') {
      return HttpResponse.json(
        {
          success: false,
          error: 'Database connection failed',
        },
        { status: 500 }
      );
    }

    if (scenario === 'slow') {
      await simulateNetworkDelay(3000, 8000);
    } else {
      await simulateNetworkDelay(300, 1200);
    }

    const ticket = findMockTicket(ticketNo as string);

    if (ticket) {
      return HttpResponse.json({
        success: true,
        data: ticket,
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: 'Ticket not found',
      },
      { status: 404 }
    );
  }),

  http.post('/api/tickets/batch', async ({ request }) => {
    await simulateNetworkDelay(500, 1500);

    const body = (await request.json()) as { ticketNos: string[] };
    const tickets = body.ticketNos
      .map(ticketNo => findMockTicket(ticketNo))
      .filter(Boolean) as TicketData[];

    return HttpResponse.json({
      success: true,
      data: tickets,
    });
  }),

  http.post('/api/tickets/check-availability', async ({ request }) => {
    await simulateNetworkDelay(200, 600);

    const body = (await request.json()) as { ticketNos: string[] };
    const availability: Record<
      string,
      { available: boolean; reason?: string }
    > = {};

    body.ticketNos.forEach(ticketNo => {
      const ticket = findMockTicket(ticketNo);
      if (!ticket) {
        availability[ticketNo] = {
          available: false,
          reason: 'Ticket not found',
        };
      } else if (ticket.status === TicketStatus.R) {
        availability[ticketNo] = {
          available: false,
          reason: 'Ticket already redeemed',
        };
      } else {
        availability[ticketNo] = { available: true };
      }
    });

    return HttpResponse.json({
      success: true,
      data: availability,
    });
  }),

  http.get('/api/tickets/:ticketNo/calculate', async ({ params, request }) => {
    await simulateNetworkDelay(300, 800);

    const { ticketNo } = params;
    const url = new URL(request.url);
    const calculationDate =
      url.searchParams.get('calculationDate') || new Date().toISOString();

    const ticket = findMockTicket(ticketNo as string);

    if (!ticket) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Ticket not found',
        },
        { status: 404 }
      );
    }

    // Simulate financial calculation
    const daysSincePawn = Math.floor(
      (new Date(calculationDate).getTime() -
        new Date(ticket.dates.pawnDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const interestAccrued =
      Math.round(
        ((ticket.financial.principal * ticket.financial.interestRate) /
          100 /
          30) *
          daysSincePawn *
          100
      ) / 100;
    const penalty =
      daysSincePawn > 90
        ? Math.round(ticket.financial.principal * 0.01 * 100) / 100
        : 0;

    return HttpResponse.json({
      success: true,
      data: {
        principal: ticket.financial.principal,
        interest: interestAccrued,
        totalAmount: ticket.financial.principal + interestAccrued + penalty,
        daysOverdue: Math.max(0, daysSincePawn - 90),
        penaltyAmount: penalty,
      },
    });
  }),

  // Customer endpoints
  http.get('/api/customers/search', async ({ request }) => {
    console.log('🔍 Mock: Handling GET /api/customers/search', request.url);
    await simulateNetworkDelay(300, 800);

    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const type = url.searchParams.get('type');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Default to all customers when no query is provided
    let filteredCustomers = mockCustomers;

    if (query) {
      filteredCustomers = mockCustomers.filter(customer => {
        switch (type) {
          case 'name':
            return customer.name.toLowerCase().includes(query.toLowerCase());
          case 'nric':
            return customer.nric.toLowerCase().includes(query.toLowerCase());
          case 'contact':
            return customer.contact.includes(query);
          default:
            return (
              customer.name.toLowerCase().includes(query.toLowerCase()) ||
              customer.nric.toLowerCase().includes(query.toLowerCase()) ||
              customer.contact.includes(query)
            );
        }
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedCustomers,
        pagination: {
          page,
          limit,
          total: filteredCustomers.length,
          totalPages: Math.ceil(filteredCustomers.length / limit),
          hasNext: endIndex < filteredCustomers.length,
          hasPrev: page > 1,
        },
      },
    });
  }),

  http.get('/api/customers/:customerId', async ({ params }) => {
    await simulateNetworkDelay(200, 600);

    const { customerId } = params;
    const customer = findMockCustomer(customerId as string);

    if (customer) {
      return HttpResponse.json({
        success: true,
        data: customer,
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: 'Customer not found',
      },
      { status: 404 }
    );
  }),

  http.post('/api/customers', async ({ request }) => {
    await simulateNetworkDelay(500, 1200);

    const body = (await request.json()) as any;

    // Check for duplicate NRIC
    const existingCustomer = findMockCustomerByNric(body.nric);
    if (existingCustomer) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Customer with this NRIC already exists',
        },
        { status: 422 }
      );
    }

    const newCustomer: Customer = {
      id: generateCustomerId(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCustomers.push(newCustomer);

    return HttpResponse.json({
      success: true,
      data: newCustomer,
    });
  }),

  http.post('/api/customers/check-duplicate', async ({ request }) => {
    await simulateNetworkDelay(200, 500);

    const body = (await request.json()) as { nric: string };
    const existingCustomer = findMockCustomerByNric(body.nric);

    return HttpResponse.json({
      success: true,
      data: {
        isDuplicate: !!existingCustomer,
        existingCustomer,
      },
    });
  }),

  http.get('/api/customers/:customerId/credit-rating', async ({ params }) => {
    await simulateNetworkDelay(800, 1500);

    const { customerId } = params;
    const customer = findMockCustomer(customerId as string);

    if (!customer) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Customer not found',
        },
        { status: 404 }
      );
    }

    // Generate mock credit rating
    const score = Math.floor(Math.random() * 300) + 500; // 500-800 range
    const rating =
      score >= 750
        ? 'A'
        : score >= 650
          ? 'B'
          : score >= 550
            ? 'C'
            : score >= 450
              ? 'D'
              : 'F';

    return HttpResponse.json({
      success: true,
      data: {
        customerId: customer.id,
        score,
        rating,
        outstandingAmount: Math.floor(Math.random() * 5000),
        creditLimit: 10000,
        utilizationRate: Math.floor(Math.random() * 80),
        riskFactors: [
          {
            factor: 'Payment History',
            impact: 'low',
            description: 'Consistent payment history',
          },
        ],
        history: [
          {
            date: '2024-06-01',
            score: score - 10,
            rating,
            change: 'improved',
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
    });
  }),

  http.get('/api/customers/:customerId/credit-details', async ({ params }) => {
    await simulateNetworkDelay(800, 1500);

    const { customerId } = params;
    const customer = findMockCustomer(customerId as string);

    if (!customer) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Customer not found',
        },
        { status: 404 }
      );
    }

    // Generate mock detailed credit assessment
    const score = Math.floor(Math.random() * 300) + 500; // 500-800 range
    const rating = score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : score >= 550 ? 'Fair' : 'Poor';
    const riskLevel = score >= 700 ? 'Low' : score >= 600 ? 'Medium' : 'High';
    
    const mockTransactionHistory = [
      { type: 'Ticket Renewal', date: '2024-12-01', amount: 125.50, status: 'completed' },
      { type: 'Ticket Redemption', date: '2024-11-15', amount: 520.00, status: 'completed' },
      { type: 'New Pledge', date: '2024-10-28', amount: 450.00, status: 'completed' },
      { type: 'Interest Payment', date: '2024-10-10', amount: 32.50, status: 'completed' },
      { type: 'Ticket Renewal', date: '2024-09-22', amount: 89.75, status: 'completed' }
    ];

    const mockAssessmentFactors = [
      { factor: 'Payment History', impact: 'positive' as const, weight: 35 },
      { factor: 'Current Outstanding', impact: score > 600 ? 'neutral' as const : 'negative' as const, weight: 25 },
      { factor: 'Account Age', impact: 'positive' as const, weight: 15 },
      { factor: 'Credit Utilization', impact: 'neutral' as const, weight: 15 },
      { factor: 'Recent Activity', impact: 'positive' as const, weight: 10 }
    ];

    const mockRecommendations = [
      'Continue regular payment schedule to maintain excellent credit standing',
      'Consider increasing credit limit based on consistent payment history',
      'Monitor outstanding balances to optimize credit utilization',
      'Review account periodically for potential promotional offers'
    ];

    return HttpResponse.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          nric: customer.nric,
          contact: customer.contact,
          address: customer.address
        },
        creditScore: score,
        rating,
        riskLevel,
        totalExposure: Math.floor(Math.random() * 3000) + 500,
        recommendedCreditLimit: Math.floor(score * 15),
        lastAssessmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        transactionHistory: mockTransactionHistory,
        assessmentFactors: mockAssessmentFactors,
        recommendations: mockRecommendations
      },
    });
  }),

  // Transaction processing endpoints
  http.get('/api/transactions/recent', async ({ request }) => {
    try {
      console.log('💳 Mock: Handling GET /api/transactions/recent', request.url);
      const scenario = getResponseScenario();
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '10');

      if (scenario === 'error') {
        return HttpResponse.json(
          {
            success: false,
            error: 'Failed to fetch recent transactions (simulated)',
          },
          { status: 500 }
        );
      }

      if (scenario === 'slow') {
        await simulateNetworkDelay(1500, 3000);
      } else {
        await simulateNetworkDelay(300, 800);
      }

      const recentTransactions = mockTransactions.slice(0, limit);

      return HttpResponse.json({
        success: true,
        data: recentTransactions,
      });
    } catch (error) {
      console.error('Error in /api/transactions/recent handler:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Internal mock server error in recent transactions handler',
        },
        { status: 500 }
      );
    }
  }),

  http.post('/api/transactions/lost-report', async ({ request }) => {
    const scenario = getResponseScenario();

    if (scenario === 'error') {
      return HttpResponse.json(
        {
          success: false,
          error: 'Lost report processing failed',
        },
        { status: 500 }
      );
    }

    if (scenario === 'slow') {
      await simulateNetworkDelay(3000, 8000);
    } else {
      await simulateNetworkDelay(1000, 3000);
    }

    const body = (await request.json()) as any;
    const transactionId = generateTransactionId();

    return HttpResponse.json({
      success: true,
      data: {
        transactionId,
        receipts: [
          {
            id: `LLR${Date.now()}`,
            type: 'lost_letter',
            url: `/receipts/lost-report-${transactionId}.pdf`,
          },
        ],
        updatedTickets: body.tickets,
        totalAmount: 50.00, // Fixed lost report fee
      },
    });
  }),

  http.post('/api/transactions/combined', async ({ request }) => {
    const scenario = getResponseScenario();

    if (scenario === 'error') {
      return HttpResponse.json(
        {
          success: false,
          error: 'Combined transaction processing failed',
        },
        { status: 500 }
      );
    }

    if (scenario === 'slow') {
      await simulateNetworkDelay(4000, 10000);
    } else {
      await simulateNetworkDelay(1500, 4000);
    }

    const body = (await request.json()) as any;
    const transactionId = generateTransactionId();
    
    // Calculate net amount
    const renewalAmount = body.renewals?.length * 100 || 0;
    const redemptionAmount = body.redemptions?.length * 500 || 0;
    const netAmount = renewalAmount - redemptionAmount;

    return HttpResponse.json({
      success: true,
      data: {
        transactionId,
        receipts: [
          {
            id: `CMB${Date.now()}`,
            type: 'receipt',
            url: `/receipts/combined-${transactionId}.pdf`,
          },
        ],
        newTickets: body.renewals?.map(() => generateTicketNo()) || [],
        updatedTickets: [...(body.renewals || []), ...(body.redemptions?.map((r: any) => r.ticketNo) || [])],
        totalAmount: Math.abs(netAmount),
        changeAmount: netAmount < 0 ? Math.abs(netAmount) : 0,
      },
    });
  }),

  http.post('/api/transactions/renewal', async ({ request }) => {
    const scenario = getResponseScenario();

    if (scenario === 'error') {
      return HttpResponse.json(
        {
          success: false,
          error: 'Transaction processing failed',
        },
        { status: 500 }
      );
    }

    if (scenario === 'slow') {
      await simulateNetworkDelay(3000, 8000);
    } else {
      await simulateNetworkDelay(1000, 3000);
    }

    const body = (await request.json()) as any;
    const transactionId = generateTransactionId();

    return HttpResponse.json({
      success: true,
      data: {
        transactionId,
        receipts: [
          {
            id: `RCP${Date.now()}`,
            type: 'receipt',
            url: `/receipts/renewal-${transactionId}.pdf`,
          },
        ],
        newTickets: [generateTicketNo()],
        updatedTickets: body.tickets,
        totalAmount: body.payment.cashAmount + body.payment.digitalAmount,
      },
    });
  }),

  http.post('/api/transactions/redemption', async ({ request }) => {
    await simulateNetworkDelay(1000, 3000);

    const body = (await request.json()) as any;
    const transactionId = generateTransactionId();

    return HttpResponse.json({
      success: true,
      data: {
        transactionId,
        receipts: [
          {
            id: `RCP${Date.now()}`,
            type: 'receipt',
            url: `/receipts/redemption-${transactionId}.pdf`,
          },
        ],
        updatedTickets: [body.ticketNo],
        totalAmount: body.payment.cashAmount + body.payment.digitalAmount,
        changeAmount: Math.max(
          0,
          body.payment.cashAmount + body.payment.digitalAmount - 1000
        ),
      },
    });
  }),

  http.post('/api/transactions/validate', async ({ request }) => {
    await simulateNetworkDelay(200, 600);

    const body = (await request.json()) as any;

    // Simulate validation logic
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    if (body.tickets.length === 0) {
      errors.push({
        field: 'tickets',
        message: 'At least one ticket is required',
      });
    }

    if (body.tickets.length > 10) {
      warnings.push({
        field: 'tickets',
        message: 'Processing many tickets may take longer',
      });
    }

    return HttpResponse.json({
      success: true,
      data: {
        valid: errors.length === 0,
        errors,
        warnings,
      },
    });
  }),

  http.post('/api/transactions/calculate', async ({ request }) => {
    await simulateNetworkDelay(400, 1000);

    const body = (await request.json()) as any;

    // Mock calculation
    const breakdown = body.tickets.map((ticketNo: string) => {
      const principal = Math.floor(Math.random() * 2000) + 500;
      const interest = Math.floor(principal * 0.03);
      const penalty = Math.floor(Math.random() * 50);

      return {
        ticketNo,
        principal,
        interest,
        penalty,
        total: principal + interest + penalty,
      };
    });

    const totalAmount = breakdown.reduce(
      (sum: number, item: any) => sum + item.total,
      0
    );

    return HttpResponse.json({
      success: true,
      data: {
        totalAmount,
        breakdown,
        fees: [
          {
            type: 'processing',
            amount: 5,
            description: 'Processing fee',
          },
        ],
      },
    });
  }),

  // System endpoints
  http.get('/api/system/status', async () => {
    await simulateNetworkDelay(200, 500);

    return HttpResponse.json({
      success: true,
      data: {
        status: Math.random() > 0.9 ? 'degraded' : 'healthy',
        timestamp: new Date().toISOString(),
        services: [
          {
            name: 'database',
            status: 'up',
            responseTime: Math.floor(Math.random() * 100) + 20,
            lastCheck: new Date().toISOString(),
          },
          {
            name: 'print-service',
            status: Math.random() > 0.95 ? 'down' : 'up',
            responseTime: Math.floor(Math.random() * 200) + 50,
            lastCheck: new Date().toISOString(),
          },
          {
            name: 'authentication',
            status: 'up',
            responseTime: Math.floor(Math.random() * 50) + 10,
            lastCheck: new Date().toISOString(),
          },
        ],
        version: '1.0.0',
      },
    });
  }),

  http.get('/api/system/health', async () => {
    await simulateNetworkDelay(500, 1200);

    const checks = [
      {
        name: 'database',
        status: 'pass' as const,
        message: 'Database connection healthy',
        duration: Math.floor(Math.random() * 50) + 10,
      },
      {
        name: 'memory',
        status: Math.random() > 0.8 ? 'warn' : ('pass' as const),
        message:
          Math.random() > 0.8 ? 'Memory usage high' : 'Memory usage normal',
        duration: Math.floor(Math.random() * 20) + 5,
      },
      {
        name: 'disk',
        status: 'pass' as const,
        message: 'Disk space sufficient',
        duration: Math.floor(Math.random() * 30) + 8,
      },
    ];

    const hasFailures = checks.some(check => check.status === 'fail');
    const hasWarnings = checks.some(check => check.status === 'warn');

    return HttpResponse.json({
      success: true,
      data: {
        overall: hasFailures
          ? 'unhealthy'
          : hasWarnings
            ? 'degraded'
            : 'healthy',
        checks,
      },
    });
  }),

  http.get('/api/system/metrics', async () => {
    await simulateNetworkDelay(300, 700);

    return HttpResponse.json({
      success: true,
      data: {
        uptime: Math.floor(Math.random() * 86400) + 3600, // 1-24 hours
        memoryUsage: Math.floor(Math.random() * 40) + 40, // 40-80%
        cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
        diskUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
        activeConnections: Math.floor(Math.random() * 50) + 10,
        requestsPerMinute: Math.floor(Math.random() * 200) + 50,
        averageResponseTime: Math.floor(Math.random() * 500) + 200,
        errorRate: Math.random() * 2, // 0-2%
        throughput: Math.floor(Math.random() * 1000) + 500,
        peakMemory: Math.floor(Math.random() * 20) + 80,
        peakCpu: Math.floor(Math.random() * 40) + 60,
      },
    });
  }),

  // Document/Receipt endpoints
  http.post('/api/documents/print', async ({ request }) => {
    await simulateNetworkDelay(500, 1500);
    
    await request.json();
    const printJobId = `PRINT${Date.now()}`;
    
    return HttpResponse.json({
      success: true,
      data: {
        printJobId,
        status: 'queued',
        estimatedTime: 30,
      },
    });
  }),

  http.post('/api/documents/reprint-lost-letter', async ({ request }) => {
    await simulateNetworkDelay(800, 2000);
    
    const body = (await request.json()) as any;
    
    // Find receipt by number
    const receiptExists = body.receiptNo && body.receiptNo.startsWith('LLR');
    
    if (!receiptExists) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Receipt not found or invalid receipt number',
        },
        { status: 404 }
      );
    }
    
    const printJobId = `REPRINT${Date.now()}`;
    
    return HttpResponse.json({
      success: true,
      data: {
        printJobId,
        status: 'queued',
        documentUrl: `/receipts/reprint-${body.receiptNo}.pdf`,
        estimatedTime: 20,
      },
    });
  }),

  http.get('/api/documents/print-status/:printJobId', async ({ params }) => {
    await simulateNetworkDelay(100, 300);
    
    const { printJobId } = params;
    
    // Simulate print job progression
    const random = Math.random();
    const status = random > 0.8 ? 'completed' : random > 0.6 ? 'printing' : random > 0.1 ? 'queued' : 'failed';
    
    return HttpResponse.json({
      success: true,
      data: {
        printJobId,
        status,
        ...(status === 'failed' && { error: 'Printer offline' }),
      },
    });
  }),

  // Universal search endpoint
  http.get('/api/search', async ({ request }) => {
    await simulateNetworkDelay(400, 1000);

    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return HttpResponse.json({
        success: true,
        data: {
          tickets: [],
          customers: [],
          totalCount: 0,
          hasMore: false,
        },
      });
    }

    const matchingTickets = mockTickets.filter(
      ticket =>
        ticket.ticketNo.toLowerCase().includes(query.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(query.toLowerCase()) ||
        ticket.customer.nric.toLowerCase().includes(query.toLowerCase())
    );

    const matchingCustomers = mockCustomers.filter(
      customer =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.nric.toLowerCase().includes(query.toLowerCase()) ||
        customer.contact.includes(query)
    );

    return HttpResponse.json({
      success: true,
      data: {
        tickets: matchingTickets.slice(0, 5),
        customers: matchingCustomers.slice(0, 5),
        totalCount: matchingTickets.length + matchingCustomers.length,
        hasMore: matchingTickets.length > 5 || matchingCustomers.length > 5,
        suggestions: [
          'B/0725/1234',
          'John Tan',
          'S1234567A',
          'Mary Lim',
          'B/0625/0998',
        ].filter(suggestion => 
          suggestion.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3),
      },
    });
  }),

  // File upload endpoint
  http.post('/api/files/upload', async () => {
    await simulateNetworkDelay(1000, 3000);
    
    const fileId = `FILE${Date.now()}`;
    
    return HttpResponse.json({
      success: true,
      data: {
        fileId,
        originalName: 'document.pdf',
        size: Math.floor(Math.random() * 1000000) + 100000,
        mimeType: 'application/pdf',
        url: `/files/${fileId}.pdf`,
        uploadedAt: new Date().toISOString(),
      },
    });
  }),

  // Lost pledge specific endpoints
  http.post('/api/lost-pledge/submit', async ({ request }) => {
    await simulateNetworkDelay(1500, 3000);
    
    await request.json();
    const reportId = `LPR${Date.now()}`;
    
    return HttpResponse.json({
      success: true,
      data: {
        reportId,
        status: 'submitted',
        estimatedProcessingTime: '3-5 business days',
        referenceNumber: `REF${Date.now()}`,
        requiredDocuments: [
          'Police Report (for theft)',
          'Statutory Declaration (for loss)',
          'Original receipt (if available)',
          'Photo identification',
        ],
      },
    });
  }),

  http.get('/api/lost-pledge/status/:reportId', async ({ params }) => {
    await simulateNetworkDelay(300, 800);
    
    const { reportId } = params;
    const statuses = ['submitted', 'under_review', 'approved', 'rejected', 'completed'] as const;
    const status = statuses[Math.floor(Math.random() * statuses.length)] || 'submitted';
    
    return HttpResponse.json({
      success: true,
      data: {
        reportId,
        status,
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        progress: {
          submitted: true,
          documentsVerified: status !== 'submitted',
          approved: ['approved', 'completed'].includes(status),
          completed: status === 'completed',
        },
        ...(status === 'rejected' && { notes: 'Insufficient documentation provided' }),
      },
    });
  }),

  // Staff validation endpoint
  http.post('/api/staff/validate-dual-auth', async ({ request }) => {
    await simulateNetworkDelay(200, 600);
    
    const body = (await request.json()) as any;
    const { primaryStaff, secondaryStaff } = body;
    
    const primaryValid = findMockStaff(primaryStaff.staffCode) && primaryStaff.pin === '1234';
    const secondaryValid = findMockStaff(secondaryStaff.staffCode) && secondaryStaff.pin === '1234';
    const differentStaff = primaryStaff.staffCode !== secondaryStaff.staffCode;
    
    return HttpResponse.json({
      success: true,
      data: {
        valid: primaryValid && secondaryValid && differentStaff,
        primaryStaffValid: primaryValid,
        secondaryStaffValid: secondaryValid,
        differentStaff,
        error: !differentStaff ? 'Staff members must be different' : 
               !primaryValid ? 'Primary staff authentication failed' :
               !secondaryValid ? 'Secondary staff authentication failed' : undefined,
      },
    });
  }),
];

// Export individual handlers for selective usage
export {
  simulateNetworkDelay,
  simulateError,
  getResponseScenario,
  mockStaffMembers,
  mockCustomers,
  mockTickets,
  mockTransactions,
  mockLostPledgeReports,
  mockDocuments,
};
