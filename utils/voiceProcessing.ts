// This is a simplified mock implementation for voice processing
// In a real app, this would integrate with Whisper API or other voice recognition service

import { Transaction, TransactionType, EntryMethod } from '../types';
import { createTransaction } from './database';
import { formatISO } from 'date-fns';

// Mock function to process voice input
export const processVoiceInput = async (
  audioData: string, // In real implementation, this would be the audio data or file path
  defaultCurrency: string
): Promise<Partial<Transaction>> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real implementation, we would:
  // 1. Send the audio data to a speech-to-text API (Whisper or similar)
  // 2. Process the returned text to extract transaction details
  // 3. Return structured data

  // For demo purposes, we'll randomly return a mock transaction
  const mockTransactions = [
    {
      amount: 5000,
      description: 'Sold tomatoes',
      type: TransactionType.INCOME,
      category: 'sales',
    },
    {
      amount: 2500,
      description: 'Paid for transport',
      type: TransactionType.EXPENSE,
      category: 'transport',
    },
    {
      amount: 10000,
      description: 'Sold maize',
      type: TransactionType.INCOME,
      category: 'sales',
    },
    {
      amount: 3000,
      description: 'Bought inventory',
      type: TransactionType.EXPENSE,
      category: 'inventory',
    }
  ];

  const mockResult = mockTransactions[Math.floor(Math.random() * mockTransactions.length)];
  
  return {
    ...mockResult,
    entryMethod: EntryMethod.VOICE,
    currencyCode: defaultCurrency,
    date: formatISO(new Date())
  };
};

// Function to extract structured data from voice text
export const extractTransactionFromText = (
  text: string,
  defaultCurrency: string
): Partial<Transaction> | null => {
  // This would be a more sophisticated NLP function in a real app
  // For now, we'll use simple regex patterns to extract information
  
  // Try to identify transaction type (income or expense)
  let type = TransactionType.EXPENSE; // Default to expense
  
  if (/sold|received|earned|income|revenue|profit/i.test(text)) {
    type = TransactionType.INCOME;
  }
  
  // Try to extract amount using regex
  const amountMatch = text.match(/(\d+[\d,]*(\.\d+)?)/);
  let amount = 0;
  
  if (amountMatch) {
    // Convert the matched string to a number, removing commas
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }
  
  if (amount <= 0) {
    return null; // Cannot create a transaction without a valid amount
  }
  
  // Extract description - use the full text for now
  // In a real app, we would clean this up more intelligently
  const description = text;
  
  // Attempt to categorize based on keywords
  let category = type === TransactionType.INCOME ? 'sales' : 'other_expense';
  
  // Very simple keyword matching for categories
  if (type === TransactionType.INCOME) {
    if (/tomato|vegetable|fruit|maize|produce|crop|harvest/i.test(text)) {
      category = 'sales';
    } else if (/service|repair|work|labor/i.test(text)) {
      category = 'services';
    } else if (/loan|borrow|credit/i.test(text)) {
      category = 'loans';
    }
  } else {
    if (/stock|inventory|goods|purchase|buy/i.test(text)) {
      category = 'inventory';
    } else if (/rent|lease/i.test(text)) {
      category = 'rent';
    } else if (/salary|wage|pay|staff/i.test(text)) {
      category = 'salaries';
    } else if (/transport|travel|fuel|bus|matatu|boda/i.test(text)) {
      category = 'transport';
    } else if (/electricity|water|power|utility/i.test(text)) {
      category = 'utilities';
    }
  }
  
  return {
    amount,
    description,
    type,
    category,
    entryMethod: EntryMethod.VOICE,
    currencyCode: defaultCurrency,
    date: formatISO(new Date())
  };
};