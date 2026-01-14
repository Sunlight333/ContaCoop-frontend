// Mock financial data for the cooperative platform

export interface BalanceSheetEntry {
  id: string;
  accountCode: string;
  accountName: string;
  category: 'assets' | 'liabilities' | 'equity';
  subcategory: string;
  initialDebit: number;
  initialCredit: number;
  periodDebit: number;
  periodCredit: number;
  finalDebit: number;
  finalCredit: number;
}

export interface CashFlowEntry {
  id: string;
  category: 'operating' | 'investing' | 'financing';
  description: string;
  amount: number;
}

export interface MembershipFee {
  id: string;
  memberId: string;
  memberName: string;
  period: string;
  expectedContribution: number;
  paymentMade: number;
  debt: number;
  status: 'up-to-date' | 'with-debt';
}

export interface FinancialRatio {
  id: string;
  name: string;
  value: number;
  description: string;
  trend: 'up' | 'down' | 'stable';
  history: { period: string; value: number }[];
}

export interface DashboardKPI {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  format: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'stable';
}

// Balance Sheet Data
export const balanceSheetData: BalanceSheetEntry[] = [
  // Assets
  { id: '1', accountCode: '1100', accountName: 'Cash and Cash Equivalents', category: 'assets', subcategory: 'Current Assets', initialDebit: 125000, initialCredit: 0, periodDebit: 45000, periodCredit: 28000, finalDebit: 142000, finalCredit: 0 },
  { id: '2', accountCode: '1200', accountName: 'Accounts Receivable', category: 'assets', subcategory: 'Current Assets', initialDebit: 78000, initialCredit: 0, periodDebit: 32000, periodCredit: 25000, finalDebit: 85000, finalCredit: 0 },
  { id: '3', accountCode: '1300', accountName: 'Inventory', category: 'assets', subcategory: 'Current Assets', initialDebit: 45000, initialCredit: 0, periodDebit: 15000, periodCredit: 12000, finalDebit: 48000, finalCredit: 0 },
  { id: '4', accountCode: '1400', accountName: 'Prepaid Expenses', category: 'assets', subcategory: 'Current Assets', initialDebit: 12000, initialCredit: 0, periodDebit: 5000, periodCredit: 4000, finalDebit: 13000, finalCredit: 0 },
  { id: '5', accountCode: '1500', accountName: 'Property, Plant & Equipment', category: 'assets', subcategory: 'Non-Current Assets', initialDebit: 350000, initialCredit: 0, periodDebit: 25000, periodCredit: 8000, finalDebit: 367000, finalCredit: 0 },
  { id: '6', accountCode: '1600', accountName: 'Accumulated Depreciation', category: 'assets', subcategory: 'Non-Current Assets', initialDebit: 0, initialCredit: 85000, periodDebit: 0, periodCredit: 5000, finalDebit: 0, finalCredit: 90000 },
  { id: '7', accountCode: '1700', accountName: 'Investments', category: 'assets', subcategory: 'Non-Current Assets', initialDebit: 95000, initialCredit: 0, periodDebit: 10000, periodCredit: 0, finalDebit: 105000, finalCredit: 0 },
  // Liabilities
  { id: '8', accountCode: '2100', accountName: 'Accounts Payable', category: 'liabilities', subcategory: 'Current Liabilities', initialDebit: 0, initialCredit: 42000, periodDebit: 18000, periodCredit: 22000, finalDebit: 0, finalCredit: 46000 },
  { id: '9', accountCode: '2200', accountName: 'Short-term Loans', category: 'liabilities', subcategory: 'Current Liabilities', initialDebit: 0, initialCredit: 65000, periodDebit: 15000, periodCredit: 10000, finalDebit: 0, finalCredit: 60000 },
  { id: '10', accountCode: '2300', accountName: 'Accrued Expenses', category: 'liabilities', subcategory: 'Current Liabilities', initialDebit: 0, initialCredit: 18000, periodDebit: 5000, periodCredit: 8000, finalDebit: 0, finalCredit: 21000 },
  { id: '11', accountCode: '2400', accountName: 'Long-term Debt', category: 'liabilities', subcategory: 'Non-Current Liabilities', initialDebit: 0, initialCredit: 150000, periodDebit: 12000, periodCredit: 0, finalDebit: 0, finalCredit: 138000 },
  // Equity
  { id: '12', accountCode: '3100', accountName: 'Member Capital', category: 'equity', subcategory: 'Member Equity', initialDebit: 0, initialCredit: 280000, periodDebit: 0, periodCredit: 25000, finalDebit: 0, finalCredit: 305000 },
  { id: '13', accountCode: '3200', accountName: 'Retained Earnings', category: 'equity', subcategory: 'Member Equity', initialDebit: 0, initialCredit: 65000, periodDebit: 0, periodCredit: 15000, finalDebit: 0, finalCredit: 80000 },
];

// Cash Flow Data
export const cashFlowData: CashFlowEntry[] = [
  // Operating Activities
  { id: '1', category: 'operating', description: 'Net Income', amount: 45000 },
  { id: '2', category: 'operating', description: 'Depreciation & Amortization', amount: 5000 },
  { id: '3', category: 'operating', description: 'Changes in Accounts Receivable', amount: -7000 },
  { id: '4', category: 'operating', description: 'Changes in Inventory', amount: -3000 },
  { id: '5', category: 'operating', description: 'Changes in Accounts Payable', amount: 4000 },
  { id: '6', category: 'operating', description: 'Changes in Accrued Expenses', amount: 3000 },
  // Investing Activities
  { id: '7', category: 'investing', description: 'Purchase of Equipment', amount: -25000 },
  { id: '8', category: 'investing', description: 'Sale of Investments', amount: 0 },
  { id: '9', category: 'investing', description: 'New Investments', amount: -10000 },
  // Financing Activities
  { id: '10', category: 'financing', description: 'Member Capital Contributions', amount: 25000 },
  { id: '11', category: 'financing', description: 'Loan Repayments', amount: -17000 },
  { id: '12', category: 'financing', description: 'Dividends Paid', amount: -8000 },
];

// Membership Fees Data
export const membershipFeesData: MembershipFee[] = [
  { id: '1', memberId: 'M001', memberName: 'Juan Martínez', period: '2024-12', expectedContribution: 500, paymentMade: 500, debt: 0, status: 'up-to-date' },
  { id: '2', memberId: 'M002', memberName: 'Ana Rodríguez', period: '2024-12', expectedContribution: 500, paymentMade: 500, debt: 0, status: 'up-to-date' },
  { id: '3', memberId: 'M003', memberName: 'Pedro Sánchez', period: '2024-12', expectedContribution: 500, paymentMade: 300, debt: 200, status: 'with-debt' },
  { id: '4', memberId: 'M004', memberName: 'María López', period: '2024-12', expectedContribution: 750, paymentMade: 750, debt: 0, status: 'up-to-date' },
  { id: '5', memberId: 'M005', memberName: 'Carlos García', period: '2024-12', expectedContribution: 500, paymentMade: 0, debt: 500, status: 'with-debt' },
  { id: '6', memberId: 'M006', memberName: 'Laura Fernández', period: '2024-12', expectedContribution: 500, paymentMade: 500, debt: 0, status: 'up-to-date' },
  { id: '7', memberId: 'M007', memberName: 'Roberto Díaz', period: '2024-12', expectedContribution: 1000, paymentMade: 800, debt: 200, status: 'with-debt' },
  { id: '8', memberId: 'M008', memberName: 'Elena Torres', period: '2024-12', expectedContribution: 500, paymentMade: 500, debt: 0, status: 'up-to-date' },
];

// Financial Ratios Data
export const financialRatiosData: FinancialRatio[] = [
  {
    id: '1',
    name: 'Current Ratio',
    value: 2.27,
    description: 'Measures the ability to pay short-term obligations',
    trend: 'up',
    history: [
      { period: 'Jul 2024', value: 2.05 },
      { period: 'Aug 2024', value: 2.10 },
      { period: 'Sep 2024', value: 2.15 },
      { period: 'Oct 2024', value: 2.18 },
      { period: 'Nov 2024', value: 2.22 },
      { period: 'Dec 2024', value: 2.27 },
    ],
  },
  {
    id: '2',
    name: 'Debt to Assets',
    value: 0.40,
    description: 'Proportion of assets financed by debt',
    trend: 'down',
    history: [
      { period: 'Jul 2024', value: 0.48 },
      { period: 'Aug 2024', value: 0.46 },
      { period: 'Sep 2024', value: 0.44 },
      { period: 'Oct 2024', value: 0.43 },
      { period: 'Nov 2024', value: 0.41 },
      { period: 'Dec 2024', value: 0.40 },
    ],
  },
  {
    id: '3',
    name: 'Return on Equity',
    value: 0.117,
    description: 'Profitability relative to member equity',
    trend: 'up',
    history: [
      { period: 'Jul 2024', value: 0.095 },
      { period: 'Aug 2024', value: 0.098 },
      { period: 'Sep 2024', value: 0.102 },
      { period: 'Oct 2024', value: 0.108 },
      { period: 'Nov 2024', value: 0.112 },
      { period: 'Dec 2024', value: 0.117 },
    ],
  },
  {
    id: '4',
    name: 'Operating Margin',
    value: 0.156,
    description: 'Operating income as a percentage of revenue',
    trend: 'stable',
    history: [
      { period: 'Jul 2024', value: 0.148 },
      { period: 'Aug 2024', value: 0.152 },
      { period: 'Sep 2024', value: 0.155 },
      { period: 'Oct 2024', value: 0.153 },
      { period: 'Nov 2024', value: 0.157 },
      { period: 'Dec 2024', value: 0.156 },
    ],
  },
];

// Dashboard KPIs
export const dashboardKPIs: DashboardKPI[] = [
  { id: '1', label: 'Total Assets', value: 670000, previousValue: 620000, format: 'currency', trend: 'up' },
  { id: '2', label: 'Total Liabilities', value: 265000, previousValue: 275000, format: 'currency', trend: 'down' },
  { id: '3', label: 'Member Equity', value: 385000, previousValue: 345000, format: 'currency', trend: 'up' },
  { id: '4', label: 'Net Cash Flow', value: 12000, previousValue: 8500, format: 'currency', trend: 'up' },
];

// Mock users for admin
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'socio';
  status: 'active' | 'inactive';
  lastLogin: string;
}

export const mockUsers: MockUser[] = [
  { id: '1', name: 'Maria García', email: 'admin@cooperative.com', role: 'admin', status: 'active', lastLogin: '2024-12-10 09:30' },
  { id: '2', name: 'Carlos López', email: 'socio@cooperative.com', role: 'socio', status: 'active', lastLogin: '2024-12-09 14:15' },
  { id: '3', name: 'Juan Martínez', email: 'juan.m@cooperative.com', role: 'socio', status: 'active', lastLogin: '2024-12-08 11:45' },
  { id: '4', name: 'Ana Rodríguez', email: 'ana.r@cooperative.com', role: 'socio', status: 'active', lastLogin: '2024-12-07 16:20' },
  { id: '5', name: 'Pedro Sánchez', email: 'pedro.s@cooperative.com', role: 'socio', status: 'inactive', lastLogin: '2024-11-15 10:00' },
];

// Upload history
export interface UploadRecord {
  id: string;
  date: string;
  user: string;
  period: string;
  modules: string[];
  status: 'success' | 'failed' | 'partial';
  errorMessage?: string;
}

export const uploadHistory: UploadRecord[] = [
  { id: '1', date: '2024-12-10 08:45', user: 'Maria García', period: 'December 2024', modules: ['Balance Sheet', 'Cash Flow', 'Membership Fees'], status: 'success' },
  { id: '2', date: '2024-11-05 10:30', user: 'Maria García', period: 'November 2024', modules: ['Balance Sheet', 'Cash Flow', 'Membership Fees', 'Ratios'], status: 'success' },
  { id: '3', date: '2024-10-03 14:20', user: 'Maria García', period: 'October 2024', modules: ['Balance Sheet', 'Cash Flow'], status: 'partial', errorMessage: 'Membership Fees file had invalid format' },
  { id: '4', date: '2024-09-02 09:15', user: 'Maria García', period: 'September 2024', modules: ['Balance Sheet', 'Cash Flow', 'Membership Fees', 'Ratios'], status: 'success' },
];
