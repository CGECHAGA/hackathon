import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../constants/Currency';
import { format } from 'date-fns';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import FontConfig from '../constants/FontConfig';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ShoppingBag, 
  Briefcase, 
  CreditCard, 
  PlusCircle,
  Package, 
  Home, 
  Users, 
  Truck, 
  Zap, 
  MinusCircle,
  Mic,
  Camera,
  PenSquare
} from 'lucide-react-native';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

const getCategoryIcon = (category: string, type: TransactionType) => {
  // Return appropriate icon based on category and type
  switch (category) {
    // Income categories
    case 'sales':
      return <ShoppingBag size={Layout.sizes.iconMedium} color={Colors.accent[500]} />;
    case 'services':
      return <Briefcase size={Layout.sizes.iconMedium} color={Colors.primary[500]} />;
    case 'loans':
      return <CreditCard size={Layout.sizes.iconMedium} color={Colors.warning[500]} />;
    case 'other_income':
      return <PlusCircle size={Layout.sizes.iconMedium} color={Colors.secondary[500]} />;
    
    // Expense categories
    case 'inventory':
      return <Package size={Layout.sizes.iconMedium} color={Colors.secondary[500]} />;
    case 'rent':
      return <Home size={Layout.sizes.iconMedium} color={Colors.primary[500]} />;
    case 'salaries':
      return <Users size={Layout.sizes.iconMedium} color={Colors.accent[500]} />;
    case 'transport':
      return <Truck size={Layout.sizes.iconMedium} color={Colors.warning[500]} />;
    case 'utilities':
      return <Zap size={Layout.sizes.iconMedium} color={Colors.error[500]} />;
    case 'other_expense':
      return <MinusCircle size={Layout.sizes.iconMedium} color={Colors.gray[500]} />;
    
    // Default case
    default:
      return type === TransactionType.INCOME 
        ? <ArrowUpCircle size={Layout.sizes.iconMedium} color={Colors.accent[500]} />
        : <ArrowDownCircle size={Layout.sizes.iconMedium} color={Colors.error[500]} />;
  }
};

const getEntryMethodIcon = (entryMethod: string) => {
  switch (entryMethod) {
    case 'voice':
      return <Mic size={16} color={Colors.primary[500]} />;
    case 'photo':
      return <Camera size={16} color={Colors.secondary[500]} />;
    default:
      return <PenSquare size={16} color={Colors.gray[500]} />;
  }
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onPress }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  
  return (
    <TouchableOpacity 
      style={[styles.container, isIncome ? styles.incomeContainer : styles.expenseContainer]}
      onPress={() => onPress?.(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getCategoryIcon(transaction.category, transaction.type)}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={styles.date}>
            {format(new Date(transaction.date), 'dd MMM, yyyy')}
          </Text>
          <View style={styles.entryMethodContainer}>
            {getEntryMethodIcon(transaction.entryMethod)}
            {!transaction.synced && (
              <View style={styles.syncStatusDot} />
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount, 
          isIncome ? styles.incomeText : styles.expenseText
        ]}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, transaction.currencyCode)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Layout.spacing.m,
    marginVertical: Layout.spacing.s,
    borderRadius: Layout.borderRadius.m,
    backgroundColor: Colors.white,
    ...Layout.shadows.small,
    alignItems: 'center',
  },
  incomeContainer: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent[500],
  },
  expenseContainer: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error[500],
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.s,
    backgroundColor: Colors.gray[100],
    marginRight: Layout.spacing.m,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 16,
    color: Colors.gray[900],
    marginBottom: Layout.spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontFamily: FontConfig.body,
    fontSize: 12,
    color: Colors.gray[500],
  },
  entryMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Layout.spacing.m,
  },
  syncStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning[500],
    marginLeft: Layout.spacing.xs,
  },
  amountContainer: {
    marginLeft: Layout.spacing.m,
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: FontConfig.subheading,
    fontSize: 16,
  },
  incomeText: {
    color: Colors.accent[600],
  },
  expenseText: {
    color: Colors.error[600],
  },
});

export default TransactionCard;