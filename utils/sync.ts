import { supabase } from './supabase';
import { getTransactions, addTransaction, getSettings } from './database';
import { Transaction } from '../types';
import NetInfo from '@react-native-community/netinfo';

// Check if the device is connected to the internet
export const checkConnectivity = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

// Check if we should sync based on settings
export const shouldSync = async (): Promise<boolean> => {
  const settings = await getSettings();
  if (!settings.autoSync) return false;
  
  const isConnected = await checkConnectivity();
  if (!isConnected) return false;
  
  if (settings.syncOnlyOnWifi) {
    const netInfo = await NetInfo.fetch();
    return netInfo.type === 'wifi';
  }
  
  return true;
};

// Sync local transactions to the cloud
export const syncTransactions = async (): Promise<number> => {
  try {
    // Check if we should sync
    const canSync = await shouldSync();
    if (!canSync) return 0;
    
    // Get unsynced transactions
    const unsyncedTransactions = await getTransactions(1000, 0, {});
    const toSync = unsyncedTransactions.filter(t => !t.synced);
    
    if (toSync.length === 0) return 0;
    
    // Sync each transaction
    let syncCount = 0;
    
    for (const transaction of toSync) {
      const { error } = await supabase
        .from('transactions')
        .upsert({
          id: transaction.id,
          amount: transaction.amount,
          description: transaction.description,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
          created_at: transaction.createdAt,
          updated_at: transaction.updatedAt,
          entry_method: transaction.entryMethod,
          currency_code: transaction.currencyCode,
          // Note: We don't sync the actual image file, just the metadata
          has_image: !!transaction.imagePath
        });
      
      if (!error) {
        // Mark as synced in local DB
        transaction.synced = true;
        await addTransaction(transaction);
        syncCount++;
      }
    }
    
    return syncCount;
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return 0;
  }
};

// This mock implementation simulates the process - in a real app, this would use
// the Supabase client to fetch data and update the local database
export const syncFromCloud = async (): Promise<number> => {
  // For demo purposes, we'll just return a success value
  return 0;
};