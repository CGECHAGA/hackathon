import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { createWorker } from 'tesseract.js';
import { Transaction, TransactionType, EntryMethod } from '../types';
import { formatISO } from 'date-fns';

// Process receipt image and extract data
export const processReceiptImage = async (
  imagePath: string,
  defaultCurrency: string
): Promise<Partial<Transaction>> => {
  try {
    // Compress and optimize the image for OCR
    const processedImage = await optimizeImage(imagePath);
    
    // Extract text from the image using Tesseract OCR
    const extractedText = await extractTextFromImage(processedImage.uri);
    
    // Parse the text to extract transaction details
    const transactionData = parseReceiptText(extractedText, defaultCurrency);
    
    // Save the processed image for reference
    const savedImagePath = await saveProcessedImage(processedImage.uri);
    
    return {
      ...transactionData,
      imagePath: savedImagePath,
      entryMethod: EntryMethod.PHOTO,
      date: formatISO(new Date())
    };
  } catch (error) {
    console.error('Error processing receipt image:', error);
    throw error;
  }
};

// Optimize image for OCR processing
const optimizeImage = async (imagePath: string) => {
  try {
    return await ImageManipulator.manipulateAsync(
      imagePath,
      [
        { resize: { width: 1000 } }, // Resize to reasonable dimensions
        { rotate: 0 }, // Correct orientation
        { brightness: 0.1 }, // Slightly increase brightness
        { contrast: 0.1 }, // Slightly increase contrast
      ],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
};

// Extract text from image using Tesseract.js
const extractTextFromImage = async (imagePath: string): Promise<string> => {
  // This is a mock implementation for demo purposes
  // In a real app, you would integrate with Tesseract.js properly
  
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock OCR text based on random templates
  const mockReceipts = [
    `SUPERMARKET RECEIPT
     Date: 12/04/2023
     -----------------------------
     Tomatoes      KSh 550.00
     Onions        KSh 200.00
     Rice 2kg      KSh 400.00
     -----------------------------
     TOTAL:        KSh 1,150.00
     PAID:         KSh 1,200.00
     CHANGE:       KSh 50.00
     Thank you for shopping with us!`,
    
    `WHOLESALE SUPPLIES
     Invoice #: 45678
     Date: 12/04/2023
     -----------------------------
     Maize Flour 20kg   KSh 2,500.00
     Sugar 25kg         KSh 3,200.00
     Cooking Oil 10L    KSh 2,800.00
     -----------------------------
     SUBTOTAL:          KSh 8,500.00
     VAT (16%):         KSh 1,360.00
     TOTAL:             KSh 9,860.00`,
    
    `TRANSPORT RECEIPT
     Boda Boda Service
     Date: 12/04/2023
     -----------------------------
     Town to Market    KSh 300.00
     Wait Time         KSh 150.00
     -----------------------------
     TOTAL:            KSh 450.00
     Thank you for your business!`
  ];
  
  return mockReceipts[Math.floor(Math.random() * mockReceipts.length)];
};

// Parse extracted text to get transaction details
const parseReceiptText = (
  text: string,
  defaultCurrency: string
): Partial<Transaction> => {
  // In a real implementation, this would use more sophisticated techniques
  // to accurately extract amount, vendor, date, etc.
  
  // For now, we'll do a simple regex-based extraction
  let type = TransactionType.EXPENSE; // Receipts are typically expenses
  
  // Try to find a total amount using regex
  const totalMatch = text.match(/total:?\s*(?:ksh|ksh\.?|kshs\.?|ush|tsh|r|₦|₵)?\s*[\d,]+\.?\d*/i);
  let amount = 0;
  
  if (totalMatch) {
    // Extract just the number part
    const amountStr = totalMatch[0].match(/[\d,]+\.?\d*/);
    if (amountStr) {
      amount = parseFloat(amountStr[0].replace(/,/g, ''));
    }
  }
  
  // Extract a description - use the first line as vendor name
  const lines = text.split('\n').filter(line => line.trim());
  let description = lines.length > 0 ? lines[0].trim() : 'Receipt';
  
  if (description.length > 50) {
    description = description.substring(0, 47) + '...';
  }
  
  // Try to determine category based on content
  let category = 'other_expense';
  
  if (/food|grocery|supermarket|fruit|vegetable|tomato|onion|rice|flour|sugar/i.test(text)) {
    category = 'inventory';
  } else if (/transport|taxi|boda|bus|matatu|travel/i.test(text)) {
    category = 'transport';
  } else if (/rent|lease/i.test(text)) {
    category = 'rent';
  } else if (/electricity|water|utility|power/i.test(text)) {
    category = 'utilities';
  }
  
  return {
    amount,
    description: `${description} (Receipt)`,
    type,
    category,
    currencyCode: defaultCurrency
  };
};

// Save the processed image to a permanent location
const saveProcessedImage = async (tempImageUri: string): Promise<string> => {
  const timestamp = new Date().getTime();
  const newFilePath = `${FileSystem.documentDirectory}receipts/receipt_${timestamp}.jpg`;
  
  // Ensure directory exists
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}receipts/`, {
    intermediates: true
  }).catch(() => {});
  
  // Copy the file
  await FileSystem.copyAsync({
    from: tempImageUri,
    to: newFilePath
  });
  
  return newFilePath;
};