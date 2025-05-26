import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { router } from 'expo-router';
import { Mic, Camera, ChevronDown, Calendar, Save } from 'lucide-react-native';
import { v4 as uuidv4 } from 'uuid';
import { TransactionType, EntryMethod } from '@/types';
import { getSettings, createTransaction, addTransaction } from '@/utils/database';
import { processVoiceInput } from '@/utils/voiceProcessing';
import { processReceiptImage } from '@/utils/imageProcessing';
import CategorySelector from '@/components/CategorySelector';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import FontConfig from '@/constants/FontConfig';
import { formatISO } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';

export default function AddTransactionScreen() {
  // State
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.INCOME);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(formatISO(new Date()));
  const [currency, setCurrency] = useState('KES');
  const [isProcessing, setIsProcessing] = useState(false);
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(EntryMethod.MANUAL);
  const [isRecording, setIsRecording] = useState(false);
  const [saveDraft, setSaveDraft] = useState(true);
  
  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setCurrency(settings.defaultCurrency);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Handle transaction type toggle
  const toggleTransactionType = () => {
    const newType = transactionType === TransactionType.INCOME 
      ? TransactionType.EXPENSE 
      : TransactionType.INCOME;
    
    setTransactionType(newType);
    // Reset category when changing transaction type
    setCategory('');
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setCategory(categoryId);
  };
  
  // Handle voice input
  const handleVoiceInput = async () => {
    try {
      setIsProcessing(true);
      setIsRecording(true);
      setEntryMethod(EntryMethod.VOICE);
      
      // Simulating voice recording for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process voice input (mock implementation)
      const result = await processVoiceInput('mock_audio_data', currency);
      
      // Update form with extracted data
      if (result) {
        if (result.amount) setAmount(result.amount.toString());
        if (result.description) setDescription(result.description);
        if (result.type) setTransactionType(result.type);
        if (result.category) setCategory(result.category);
      }
      
      setIsRecording(false);
    } catch (error) {
      console.error('Error processing voice input:', error);
      Alert.alert('Error', 'Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle photo input
  const handlePhotoInput = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to scan receipts.');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      
      if (result.canceled) return;
      
      setIsProcessing(true);
      setEntryMethod(EntryMethod.PHOTO);
      
      // Process receipt image
      const imageUri = result.assets[0].uri;
      const processedData = await processReceiptImage(imageUri, currency);
      
      // Update form with extracted data
      if (processedData) {
        if (processedData.amount) setAmount(processedData.amount.toString());
        if (processedData.description) setDescription(processedData.description);
        if (processedData.type) setTransactionType(processedData.type);
        if (processedData.category) setCategory(processedData.category);
      }
    } catch (error) {
      console.error('Error processing receipt image:', error);
      Alert.alert('Error', 'Failed to process receipt. Please try again or enter details manually.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Save transaction
  const saveTransaction = async () => {
    try {
      // Validate form
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount.');
        return;
      }
      
      if (!description.trim()) {
        Alert.alert('Error', 'Please enter a description.');
        return;
      }
      
      if (!category) {
        Alert.alert('Error', 'Please select a category.');
        return;
      }
      
      setIsProcessing(true);
      
      // Create transaction object
      const transaction = createTransaction({
        amount: parseFloat(amount),
        description,
        type: transactionType,
        category,
        date,
        entryMethod,
        currencyCode: currency,
      }, currency);
      
      // Save to database
      await addTransaction(transaction);
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setEntryMethod(EntryMethod.MANUAL);
      
      // Navigate back to dashboard
      router.replace('/(tabs)/index');
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Transaction Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              transactionType === TransactionType.INCOME && styles.activeIncomeButton,
            ]}
            onPress={() => setTransactionType(TransactionType.INCOME)}
          >
            <Text
              style={[
                styles.typeButtonText,
                transactionType === TransactionType.INCOME && styles.activeIncomeText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              transactionType === TransactionType.EXPENSE && styles.activeExpenseButton,
            ]}
            onPress={() => setTransactionType(TransactionType.EXPENSE)}
          >
            <Text
              style={[
                styles.typeButtonText,
                transactionType === TransactionType.EXPENSE && styles.activeExpenseText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Input Methods */}
        <View style={styles.quickInputContainer}>
          <TouchableOpacity
            style={[styles.quickInputButton, isRecording && styles.activeQuickInputButton]}
            onPress={handleVoiceInput}
            disabled={isProcessing}
          >
            <Mic 
              size={24} 
              color={isRecording ? Colors.white : Colors.primary[500]} 
            />
            <Text style={[styles.quickInputText, isRecording && styles.activeQuickInputText]}>
              Voice
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickInputButton}
            onPress={handlePhotoInput}
            disabled={isProcessing}
          >
            <Camera size={24} color={Colors.primary[500]} />
            <Text style={styles.quickInputText}>Photo</Text>
          </TouchableOpacity>
        </View>
        
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={Colors.primary[500]} />
            <Text style={styles.processingText}>
              {entryMethod === EntryMethod.VOICE
                ? 'Processing voice input...'
                : 'Processing receipt...'}
            </Text>
          </View>
        )}
        
        {/* Amount Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount ({currency})</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>
        
        {/* Description Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="What was this for?"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>
        
        {/* Category Selector */}
        <CategorySelector
          type={transactionType}
          selectedCategory={category}
          onSelectCategory={handleCategorySelect}
        />
        
        {/* Date Selector (simplified) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateSelector}>
            <Text style={styles.dateText}>Today</Text>
            <Calendar size={20} color={Colors.gray[600]} />
          </TouchableOpacity>
        </View>
        
        {/* Save as Draft Toggle */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Save and sync to cloud</Text>
          <Switch
            value={saveDraft}
            onValueChange={setSaveDraft}
            trackColor={{ false: Colors.gray[300], true: Colors.primary[300] }}
            thumbColor={saveDraft ? Colors.primary[500] : Colors.gray[100]}
          />
        </View>
        
        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveTransaction}
          disabled={isProcessing}
        >
          <Save size={20} color={Colors.white} style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: Layout.spacing.m,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.m,
    marginBottom: Layout.spacing.l,
    padding: Layout.spacing.xs,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Layout.spacing.m,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.s,
  },
  activeIncomeButton: {
    backgroundColor: Colors.accent[500],
  },
  activeExpenseButton: {
    backgroundColor: Colors.error[500],
  },
  typeButtonText: {
    fontFamily: FontConfig.subheading,
    fontSize: 16,
    color: Colors.gray[800],
  },
  activeIncomeText: {
    color: Colors.white,
  },
  activeExpenseText: {
    color: Colors.white,
  },
  quickInputContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.l,
  },
  quickInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.m,
    padding: Layout.spacing.m,
    marginRight: Layout.spacing.m,
  },
  activeQuickInputButton: {
    backgroundColor: Colors.primary[500],
  },
  quickInputText: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.gray[800],
    marginLeft: Layout.spacing.s,
  },
  activeQuickInputText: {
    color: Colors.white,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.m,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.l,
  },
  processingText: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.primary[700],
    marginLeft: Layout.spacing.s,
  },
  formGroup: {
    marginBottom: Layout.spacing.m,
  },
  label: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 16,
    color: Colors.gray[800],
    marginBottom: Layout.spacing.s,
  },
  amountInput: {
    height: Layout.sizes.inputHeight,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: Layout.borderRadius.m,
    paddingHorizontal: Layout.spacing.m,
    fontFamily: FontConfig.subheading,
    fontSize: 24,
    color: Colors.gray[900],
  },
  textInput: {
    height: Layout.sizes.inputHeight,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: Layout.borderRadius.m,
    paddingHorizontal: Layout.spacing.m,
    fontFamily: FontConfig.body,
    fontSize: 16,
    color: Colors.gray[900],
  },
  dateSelector: {
    height: Layout.sizes.inputHeight,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: Layout.borderRadius.m,
    paddingHorizontal: Layout.spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: FontConfig.body,
    fontSize: 16,
    color: Colors.gray[900],
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Layout.spacing.m,
  },
  switchLabel: {
    fontFamily: FontConfig.body,
    fontSize: 16,
    color: Colors.gray[800],
  },
  saveButton: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: Colors.primary[500],
    borderRadius: Layout.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.l,
  },
  saveIcon: {
    marginRight: Layout.spacing.s,
  },
  saveButtonText: {
    fontFamily: FontConfig.subheading,
    fontSize: 16,
    color: Colors.white,
  },
});