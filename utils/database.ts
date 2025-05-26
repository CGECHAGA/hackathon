import * as SQLite from 'expo-sqlite';
import { Transaction, TransactionType, Category, User, AppSettings, EntryMethod } from '../types';
import { formatISO } from 'date-fns';

const db = SQLite.openDatabase('trackrise.db');

// Initialize database tables
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Transactions table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            amount REAL NOT NULL,
            description TEXT NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            entry_method TEXT NOT NULL,
            currency_code TEXT NOT NULL,
            image_path TEXT,
            synced INTEGER NOT NULL
          )`
        );

        // Categories table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            type TEXT NOT NULL,
            color TEXT NOT NULL
          )`
        );

        // User table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            business_name TEXT,
            default_currency TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`
        );

        // Settings table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            default_currency TEXT NOT NULL,
            language TEXT NOT NULL,
            theme TEXT NOT NULL,
            notifications INTEGER NOT NULL,
            auto_sync INTEGER NOT NULL,
            sync_only_on_wifi INTEGER NOT NULL
          )`
        );

        // Insert default categories if they don't exist
        insertDefaultCategories(tx);
        
        // Insert default settings if they don't exist
        tx.executeSql(
          `INSERT OR IGNORE INTO settings (
            id, default_currency, language, theme, notifications, auto_sync, sync_only_on_wifi
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [1, 'KES', 'en', 'light', 1, 1, 1]
        );
      },
      error => {
        console.error('Database initialization error:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

// Insert default categories
const insertDefaultCategories = (tx: SQLite.SQLTransaction): void => {
  const defaultCategories: Partial<Category>[] = [
    // Income categories
    { id: 'sales', name: 'Sales', icon: 'shopping-bag', type: TransactionType.INCOME, color: '#00FF91' },
    { id: 'services', name: 'Services', icon: 'briefcase', type: TransactionType.INCOME, color: '#007FFF' },
    { id: 'loans', name: 'Loans', icon: 'credit-card', type: TransactionType.INCOME, color: '#FFD700' },
    { id: 'other_income', name: 'Other Income', icon: 'plus-circle', type: TransactionType.INCOME, color: '#FF8300' },
    
    // Expense categories
    { id: 'inventory', name: 'Inventory', icon: 'package', type: TransactionType.EXPENSE, color: '#FF8300' },
    { id: 'rent', name: 'Rent', icon: 'home', type: TransactionType.EXPENSE, color: '#007FFF' },
    { id: 'salaries', name: 'Salaries', icon: 'users', type: TransactionType.EXPENSE, color: '#00FF91' },
    { id: 'transport', name: 'Transport', icon: 'truck', type: TransactionType.EXPENSE, color: '#FFD700' },
    { id: 'utilities', name: 'Utilities', icon: 'zap', type: TransactionType.EXPENSE, color: '#FF0000' },
    { id: 'other_expense', name: 'Other Expense', icon: 'minus-circle', type: TransactionType.EXPENSE, color: '#808080' }
  ];

  defaultCategories.forEach(category => {
    tx.executeSql(
      `INSERT OR IGNORE INTO categories (id, name, icon, type, color) VALUES (?, ?, ?, ?, ?)`,
      [category.id, category.name, category.icon, category.type, category.color]
    );
  });
};

// Transaction CRUD operations
export const addTransaction = (transaction: Transaction): Promise<Transaction> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO transactions (
            id, amount, description, type, category, date, created_at, updated_at, 
            entry_method, currency_code, image_path, synced
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transaction.id,
            transaction.amount,
            transaction.description,
            transaction.type,
            transaction.category,
            transaction.date,
            transaction.createdAt,
            transaction.updatedAt,
            transaction.entryMethod,
            transaction.currencyCode,
            transaction.imagePath || null,
            transaction.synced ? 1 : 0
          ],
          (_, result) => {
            resolve(transaction);
          }
        );
      },
      error => {
        console.error('Error adding transaction:', error);
        reject(error);
      }
    );
  });
};

export const getTransactions = (
  limit: number = 50, 
  offset: number = 0, 
  filters: { type?: TransactionType, startDate?: string, endDate?: string } = {}
): Promise<Transaction[]> => {
  let whereClause = '';
  const params: any[] = [];

  if (filters.type) {
    whereClause += 'type = ? ';
    params.push(filters.type);
  }

  if (filters.startDate) {
    if (whereClause) whereClause += 'AND ';
    whereClause += 'date >= ? ';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    if (whereClause) whereClause += 'AND ';
    whereClause += 'date <= ? ';
    params.push(filters.endDate);
  }

  if (whereClause) {
    whereClause = 'WHERE ' + whereClause;
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM transactions ${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`,
          [...params, limit, offset],
          (_, { rows }) => {
            const transactions: Transaction[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              transactions.push({
                ...row,
                synced: !!row.synced
              } as Transaction);
            }
            resolve(transactions);
          }
        );
      },
      error => {
        console.error('Error getting transactions:', error);
        reject(error);
      }
    );
  });
};

// Categories CRUD operations
export const getCategories = (type?: TransactionType): Promise<Category[]> => {
  const whereClause = type ? 'WHERE type = ?' : '';
  const params = type ? [type] : [];
  
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM categories ${whereClause} ORDER BY name`,
          params,
          (_, { rows }) => {
            const categories: Category[] = [];
            for (let i = 0; i < rows.length; i++) {
              categories.push(rows.item(i) as Category);
            }
            resolve(categories);
          }
        );
      },
      error => {
        console.error('Error getting categories:', error);
        reject(error);
      }
    );
  });
};

// Settings operations
export const getSettings = (): Promise<AppSettings> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM settings LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              const settings = rows.item(0);
              resolve({
                defaultCurrency: settings.default_currency,
                language: settings.language,
                theme: settings.theme,
                notifications: !!settings.notifications,
                autoSync: !!settings.auto_sync,
                syncOnlyOnWifi: !!settings.sync_only_on_wifi
              });
            } else {
              // Return default settings if none exist
              resolve({
                defaultCurrency: 'KES',
                language: 'en',
                theme: 'light',
                notifications: true,
                autoSync: true,
                syncOnlyOnWifi: true
              });
            }
          }
        );
      },
      error => {
        console.error('Error getting settings:', error);
        reject(error);
      }
    );
  });
};

export const updateSettings = (settings: AppSettings): Promise<AppSettings> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `UPDATE settings SET 
            default_currency = ?, 
            language = ?, 
            theme = ?, 
            notifications = ?, 
            auto_sync = ?, 
            sync_only_on_wifi = ? 
          WHERE id = 1`,
          [
            settings.defaultCurrency,
            settings.language,
            settings.theme,
            settings.notifications ? 1 : 0,
            settings.autoSync ? 1 : 0,
            settings.syncOnlyOnWifi ? 1 : 0
          ],
          (_, result) => {
            if (result.rowsAffected > 0) {
              resolve(settings);
            } else {
              reject(new Error('No settings record found to update'));
            }
          }
        );
      },
      error => {
        console.error('Error updating settings:', error);
        reject(error);
      }
    );
  });
};

// Get summary data for dashboard
export const getDashboardSummary = (
  startDate: string,
  endDate: string
): Promise<{ totalIncome: number; totalExpenses: number }> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Get total income
        tx.executeSql(
          `SELECT SUM(amount) as total FROM transactions 
           WHERE type = ? AND date >= ? AND date <= ?`,
          [TransactionType.INCOME, startDate, endDate],
          (_, { rows }) => {
            const totalIncome = rows.item(0).total || 0;
            
            // Get total expenses
            tx.executeSql(
              `SELECT SUM(amount) as total FROM transactions 
               WHERE type = ? AND date >= ? AND date <= ?`,
              [TransactionType.EXPENSE, startDate, endDate],
              (_, { rows }) => {
                const totalExpenses = rows.item(0).total || 0;
                resolve({
                  totalIncome,
                  totalExpenses
                });
              }
            );
          }
        );
      },
      error => {
        console.error('Error getting dashboard summary:', error);
        reject(error);
      }
    );
  });
};

// Generate a new transaction
export const createTransaction = (
  data: Partial<Transaction>,
  defaultCurrency: string
): Transaction => {
  const now = new Date();
  const timestamp = formatISO(now);
  
  return {
    id: `txn_${now.getTime()}`,
    amount: data.amount || 0,
    description: data.description || '',
    type: data.type || TransactionType.INCOME,
    category: data.category || (data.type === TransactionType.INCOME ? 'sales' : 'other_expense'),
    date: data.date || timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    entryMethod: data.entryMethod || EntryMethod.MANUAL,
    currencyCode: data.currencyCode || defaultCurrency,
    imagePath: data.imagePath,
    synced: false
  };
};