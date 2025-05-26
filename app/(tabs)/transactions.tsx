import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Search, FilterX, Filter } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { getTransactions, getSettings } from '@/utils/database';
import { Transaction, TransactionType } from '@/types';
import TransactionCard from '@/components/TransactionCard';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import FontConfig from '@/constants/FontConfig';

export default function TransactionsScreen() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState('KES');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [page, setPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const ITEMS_PER_PAGE = 20;
  
  // Load initial data
  useEffect(() => {
    loadData();
  }, [activeFilter]);
  
  // Load transactions from database
  const loadData = async (isLoadingMore = false) => {
    if (!isLoadingMore) {
      setLoading(true);
      setPage(0);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      // Get user settings
      const settings = await getSettings();
      setCurrency(settings.defaultCurrency);
      
      // Prepare filter
      const filter: { type?: TransactionType } = {};
      if (activeFilter === 'income') {
        filter.type = TransactionType.INCOME;
      } else if (activeFilter === 'expense') {
        filter.type = TransactionType.EXPENSE;
      }
      
      // Get transactions
      const offset = isLoadingMore ? page * ITEMS_PER_PAGE : 0;
      const loadedTransactions = await getTransactions(
        ITEMS_PER_PAGE, 
        offset,
        filter
      );
      
      // Update state
      if (isLoadingMore) {
        setTransactions(prev => [...prev, ...loadedTransactions]);
        setPage(prev => prev + 1);
      } else {
        setTransactions(loadedTransactions);
        setPage(1);
      }
      
      // Check if we have more data
      setHasMoreData(loadedTransactions.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  // Handle transaction press
  const handleTransactionPress = (transaction: Transaction) => {
    // In a real app, we would navigate to transaction details
    console.log('Transaction pressed:', transaction.id);
  };
  
  // Load more data when reaching end of list
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreData) {
      loadData(true);
    }
  };
  
  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      transaction.description.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query) ||
      transaction.amount.toString().includes(query)
    );
  });
  
  // Apply filter
  const applyFilter = (filter: 'all' | 'income' | 'expense') => {
    if (filter !== activeFilter) {
      setActiveFilter(filter);
    }
    setFilterVisible(false);
  };
  
  // Render filter options
  const renderFilterOptions = () => {
    if (!filterVisible) return null;
    
    return (
      <View style={styles.filterOptions}>
        <TouchableOpacity
          style={[styles.filterOption, activeFilter === 'all' && styles.activeFilterOption]}
          onPress={() => applyFilter('all')}
        >
          <Text style={[styles.filterOptionText, activeFilter === 'all' && styles.activeFilterOptionText]}>
            All Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterOption, activeFilter === 'income' && styles.activeFilterOption]}
          onPress={() => applyFilter('income')}
        >
          <Text style={[styles.filterOptionText, activeFilter === 'income' && styles.activeFilterOptionText]}>
            Income Only
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterOption, activeFilter === 'expense' && styles.activeFilterOption]}
          onPress={() => applyFilter('expense')}
        >
          <Text style={[styles.filterOptionText, activeFilter === 'expense' && styles.activeFilterOptionText]}>
            Expenses Only
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  if (loading && !isLoadingMore) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.gray[500]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FilterX size={20} color={Colors.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterVisible(!filterVisible)}
        >
          <Filter size={20} color={activeFilter !== 'all' ? Colors.primary[500] : Colors.gray[700]} />
        </TouchableOpacity>
      </View>
      
      {renderFilterOptions()}
      
      <FlatList
        data={filteredTransactions}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={handleTransactionPress}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first transaction by tapping the + button'}
            </Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={Colors.primary[500]} />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
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
  searchContainer: {
    flexDirection: 'row',
    padding: Layout.spacing.m,
    gap: Layout.spacing.m,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.m,
    paddingHorizontal: Layout.spacing.m,
  },
  searchIcon: {
    marginRight: Layout.spacing.s,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: FontConfig.body,
    fontSize: 16,
    color: Colors.gray[900],
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.m,
  },
  filterOptions: {
    flexDirection: 'row',
    padding: Layout.spacing.m,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    justifyContent: 'space-between',
  },
  filterOption: {
    flex: 1,
    padding: Layout.spacing.s,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.s,
    marginHorizontal: Layout.spacing.xs,
  },
  activeFilterOption: {
    backgroundColor: Colors.primary[100],
  },
  filterOptionText: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.gray[700],
  },
  activeFilterOptionText: {
    fontFamily: FontConfig.bodyMedium,
    color: Colors.primary[700],
  },
  listContent: {
    padding: Layout.spacing.m,
  },
  emptyContainer: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingMoreContainer: {
    padding: Layout.spacing.m,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingMoreText: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.gray[600],
    marginLeft: Layout.spacing.s,
  },
});