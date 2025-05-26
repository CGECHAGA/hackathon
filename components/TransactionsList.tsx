import React from 'react';
import { FlatList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Transaction, TransactionType } from '../types';
import TransactionCard from './TransactionCard';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import FontConfig from '../constants/FontConfig';
import { formatISO } from 'date-fns';

interface TransactionsListProps {
  transactions: Transaction[];
  loading?: boolean;
  onTransactionPress?: (transaction: Transaction) => void;
  onEndReached?: () => void;
}

interface GroupedTransactions {
  title: string;
  data: Transaction[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  loading = false,
  onTransactionPress,
  onEndReached,
}) => {
  // Group transactions by date (for a real app, this would be more sophisticated)
  const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransactions[] => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = transaction.date.split('T')[0]; // Get YYYY-MM-DD part
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    
    // Convert to array format for rendering
    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date],
    }));
  };
  
  const groupedTransactions = groupTransactionsByDate(transactions);
  
  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionCard 
      transaction={item} 
      onPress={onTransactionPress}
    />
  );
  
  const renderSectionHeader = ({ section }: { section: GroupedTransactions }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );
  
  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions found</Text>
        <Text style={styles.emptySubtext}>
          Tap the + button below to add your first transaction
        </Text>
      </View>
    );
  }
  
  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={Colors.primary[500]} />
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: Layout.spacing.m,
  },
  sectionHeader: {
    backgroundColor: Colors.gray[100],
    padding: Layout.spacing.s,
    borderRadius: Layout.borderRadius.s,
    marginVertical: Layout.spacing.s,
  },
  sectionHeaderText: {
    fontFamily: FontConfig.subheading,
    fontSize: 14,
    color: Colors.gray[700],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FontConfig.body,
    fontSize: 16,
    color: Colors.gray[700],
    marginTop: Layout.spacing.m,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  emptyText: {
    fontFamily: FontConfig.subheading,
    fontSize: 18,
    color: Colors.gray[800],
    marginBottom: Layout.spacing.s,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  footer: {
    padding: Layout.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionsList;