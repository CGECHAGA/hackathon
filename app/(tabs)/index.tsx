import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getTransactions, getDashboardSummary, getSettings } from '@/utils/database';
import { syncTransactions } from '@/utils/sync';
import StatsCard from '@/components/StatsCard';
import TransactionsList from '@/components/TransactionsList';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import FontConfig from '@/constants/FontConfig';
import { Transaction } from '@/types';

const PERIOD_OPTIONS = [
  { label: 'Today', days: 0 },
  { label: 'Week', days: 7 },
  { label: 'Month', days: 30 },
  { label: '3 Months', days: 90 },
];

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(1); // Default to Week
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [currency, setCurrency] = useState('KES');
  
  // Calculate date range for selected period
  const getDateRange = () => {
    const today = new Date();
    const days = PERIOD_OPTIONS[selectedPeriodIndex].days;
    const endDate = endOfDay(today);
    const startDate = startOfDay(subDays(today, days));
    
    return { startDate, endDate };
  };
  
  // Load data
  const loadData = async (showFullLoading = true) => {
    if (showFullLoading) setLoading(true);
    
    try {
      // Get user settings
      const settings = await getSettings();
      setCurrency(settings.defaultCurrency);
      
      // Get date range
      const { startDate, endDate } = getDateRange();
      
      // Get dashboard summary
      const summaryData = await getDashboardSummary(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      // Calculate net profit
      const netProfit = summaryData.totalIncome - summaryData.totalExpenses;
      
      setSummary({
        totalIncome: summaryData.totalIncome,
        totalExpenses: summaryData.totalExpenses,
        netProfit,
      });
      
      // Get recent transactions
      const recentTransactions = await getTransactions(5, 0, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      setTransactions(recentTransactions);
      
      // Try to sync transactions in background
      syncTransactions().catch(err => 
        console.error('Background sync error:', err)
      );
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadData();
  }, [selectedPeriodIndex]);
  
  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
  };
  
  // Change period
  const changePeriod = (direction: 'prev' | 'next') => {
    setSelectedPeriodIndex(prev => {
      if (direction === 'prev' && prev > 0) {
        return prev - 1;
      } else if (direction === 'next' && prev < PERIOD_OPTIONS.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }
  
  const periodLabel = PERIOD_OPTIONS[selectedPeriodIndex].label;
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Business Summary</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            onPress={() => changePeriod('prev')}
            disabled={selectedPeriodIndex === 0}
            style={[styles.periodButton, selectedPeriodIndex === 0 && styles.disabledButton]}
          >
            <ChevronLeft size={20} color={selectedPeriodIndex === 0 ? Colors.gray[400] : Colors.primary[500]} />
          </TouchableOpacity>
          
          <Text style={styles.periodText}>{periodLabel}</Text>
          
          <TouchableOpacity 
            onPress={() => changePeriod('next')}
            disabled={selectedPeriodIndex === PERIOD_OPTIONS.length - 1}
            style={[styles.periodButton, selectedPeriodIndex === PERIOD_OPTIONS.length - 1 && styles.disabledButton]}
          >
            <ChevronRight size={20} color={selectedPeriodIndex === PERIOD_OPTIONS.length - 1 ? Colors.gray[400] : Colors.primary[500]} />
          </TouchableOpacity>
        </View>
      </View>
      
      <StatsCard
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        netProfit={summary.netProfit}
        currency={currency}
        periodLabel={periodLabel}
      />
      
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <ArrowUpRight size={20} color={Colors.accent[500]} />
          <Text style={styles.quickStatLabel}>Last Income</Text>
          <Text style={styles.quickStatValue}>Yesterday</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.quickStatItem}>
          <ArrowDownLeft size={20} color={Colors.error[500]} />
          <Text style={styles.quickStatLabel}>Last Expense</Text>
          <Text style={styles.quickStatValue}>Today</Text>
        </View>
      </View>
      
      <View style={styles.recentTransactions}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TransactionsList 
          transactions={transactions}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  contentContainer: {
    padding: Layout.spacing.m,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  welcomeText: {
    fontFamily: FontConfig.heading,
    fontSize: 22,
    color: Colors.gray[900],
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.m,
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.s,
    ...Layout.shadows.small,
  },
  periodButton: {
    padding: Layout.spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  periodText: {
    fontFamily: FontConfig.subheading,
    fontSize: 14,
    color: Colors.gray[800],
    marginHorizontal: Layout.spacing.s,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.l,
    padding: Layout.spacing.m,
    marginVertical: Layout.spacing.m,
    ...Layout.shadows.small,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontFamily: FontConfig.body,
    fontSize: 12,
    color: Colors.gray[600],
    marginTop: Layout.spacing.xs,
  },
  quickStatValue: {
    fontFamily: FontConfig.subheading,
    fontSize: 14,
    color: Colors.gray[900],
    marginTop: Layout.spacing.xs,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.gray[200],
    marginHorizontal: Layout.spacing.m,
  },
  recentTransactions: {
    marginTop: Layout.spacing.m,
  },
  sectionTitle: {
    fontFamily: FontConfig.subheading,
    fontSize: 18,
    color: Colors.gray[900],
    marginBottom: Layout.spacing.m,
  },
});