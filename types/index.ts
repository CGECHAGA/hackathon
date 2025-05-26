// Transaction types
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum EntryMethod {
  VOICE = 'voice',
  PHOTO = 'photo',
  MANUAL = 'manual'
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  category: string;
  date: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  entryMethod: EntryMethod;
  currencyCode: string;
  imagePath?: string; // Local path for photos
  synced: boolean; // Whether it's synced to the cloud
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  periodStart: string; // ISO string
  periodEnd: string; // ISO string
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  defaultCurrency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSync: boolean;
  syncOnlyOnWifi: boolean;
}

// Database types
export interface Database {
  transactions: Transaction[];
  categories: Category[];
  user: User | null;
  settings: AppSettings;
}