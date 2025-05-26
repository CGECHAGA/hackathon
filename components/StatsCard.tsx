import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react-native';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import FontConfig from '../constants/FontConfig';
import { formatCurrency } from '../constants/Currency';

interface StatsCardProps {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  currency: string;
  periodLabel: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  totalIncome,
  totalExpenses,
  netProfit,
  currency,
  periodLabel,
}) => {
  // Calculate profit percentage (handle divide by zero)
  const profitPercentage = totalIncome > 0 
    ? Math.round((netProfit / totalIncome) * 100) 
    : 0;
  
  const isProfitable = netProfit >= 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Business Summary</Text>
        <Text style={styles.periodLabel}>{periodLabel}</Text>
      </View>
      
      <View style={styles.profitRow}>
        <View style={styles.profitIconContainer}>
          <TrendingUp 
            size={Layout.sizes.iconLarge} 
            color={isProfitable ? Colors.accent[500] : Colors.error[500]} 
          />
        </View>
        <View style={styles.profitTextContainer}>
          <Text style={styles.profitLabel}>Net Profit</Text>
          <Text 
            style={[
              styles.profitAmount, 
              isProfitable ? styles.positiveAmount : styles.negativeAmount
            ]}
          >
            {formatCurrency(netProfit, currency)}
          </Text>
          <Text 
            style={[
              styles.profitPercentage,
              isProfitable ? styles.positiveAmount : styles.negativeAmount
            ]}
          >
            {profitPercentage}% {isProfitable ? 'Profit Margin' : 'Loss'}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <ArrowUpCircle size={Layout.sizes.iconMedium} color={Colors.accent[500]} />
          </View>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statAmount}>{formatCurrency(totalIncome, currency)}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <ArrowDownCircle size={Layout.sizes.iconMedium} color={Colors.error[500]} />
          </View>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={styles.statAmount}>{formatCurrency(totalExpenses, currency)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.l,
    padding: Layout.spacing.l,
    marginVertical: Layout.spacing.m,
    ...Layout.shadows.medium,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  title: {
    fontFamily: FontConfig.heading,
    fontSize: 18,
    color: Colors.gray[900],
  },
  periodLabel: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.gray[600],
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.s,
  },
  profitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    marginBottom: Layout.spacing.m,
  },
  profitIconContainer: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.m,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.l,
  },
  profitTextContainer: {
    flex: 1,
  },
  profitLabel: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: Layout.spacing.xs,
  },
  profitAmount: {
    fontFamily: FontConfig.heading,
    fontSize: 24,
    marginBottom: Layout.spacing.xs,
  },
  profitPercentage: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 14,
  },
  positiveAmount: {
    color: Colors.accent[600],
  },
  negativeAmount: {
    color: Colors.error[600],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.m,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  statLabel: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: Layout.spacing.xs,
  },
  statAmount: {
    fontFamily: FontConfig.subheading,
    fontSize: 16,
    color: Colors.gray[900],
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.gray[200],
    marginHorizontal: Layout.spacing.m,
  },
});

export default StatsCard;