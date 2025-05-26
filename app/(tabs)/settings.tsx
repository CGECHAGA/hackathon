import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { 
  Globe, 
  Moon, 
  Wifi, 
  RefreshCw, 
  Bell, 
  HelpCircle, 
  Info,
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { getSettings, updateSettings } from '@/utils/database';
import { syncTransactions, syncFromCloud, checkConnectivity } from '@/utils/sync';
import { AppSettings } from '@/types';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import FontConfig from '@/constants/FontConfig';
import currencies from '@/constants/Currency';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Load settings
  useEffect(() => {
    loadSettings();
    checkConnection();
  }, []);
  
  const loadSettings = async () => {
    try {
      const appSettings = await getSettings();
      setSettings(appSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkConnection = async () => {
    const connected = await checkConnectivity();
    setIsConnected(connected);
  };
  
  // Update a setting
  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!settings) return;
    
    try {
      const updatedSettings = { ...settings, [key]: value };
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      Alert.alert('Error', `Failed to update ${key}. Please try again.`);
    }
  };
  
  // Handle sync
  const handleSync = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to the internet to sync your data.');
      return;
    }
    
    try {
      setSyncing(true);
      const syncedCount = await syncTransactions();
      const downloadedCount = await syncFromCloud();
      
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${syncedCount} transactions to the cloud and downloaded ${downloadedCount} new transactions.`
      );
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Failed', 'An error occurred while syncing. Please try again.');
    } finally {
      setSyncing(false);
    }
  };
  
  // Get currency name
  const getCurrencyName = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? `${currency.name} (${currency.symbol})` : code;
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }
  
  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load settings</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSettings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Business Name</Text>
            <Text style={styles.settingValue}>My Business</Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[500]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Currency</Text>
            <Text style={styles.settingValue}>
              {getCurrencyName(settings.defaultCurrency)}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[500]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Globe size={20} color={Colors.primary[500]} />
            </View>
            <Text style={styles.settingLabel}>Language</Text>
          </View>
          <View style={styles.settingAction}>
            <Text style={styles.settingValue}>English</Text>
            <ChevronRight size={20} color={Colors.gray[500]} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Moon size={20} color={Colors.secondary[500]} />
            </View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={(value) => updateSetting('theme', value ? 'dark' : 'light')}
            trackColor={{ false: Colors.gray[300], true: Colors.primary[300] }}
            thumbColor={settings.theme === 'dark' ? Colors.primary[500] : Colors.gray[100]}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={Colors.accent[500]} />
            </View>
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            trackColor={{ false: Colors.gray[300], true: Colors.primary[300] }}
            thumbColor={settings.notifications ? Colors.primary[500] : Colors.gray[100]}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync & Backup</Text>
        
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionStatusText}>
            {isConnected ? 'Online' : 'Offline'}
          </Text>
          <View 
            style={[
              styles.connectionIndicator, 
              isConnected ? styles.connectedIndicator : styles.disconnectedIndicator
            ]} 
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <RefreshCw size={20} color={Colors.primary[500]} />
            </View>
            <Text style={styles.settingLabel}>Auto Sync</Text>
          </View>
          <Switch
            value={settings.autoSync}
            onValueChange={(value) => updateSetting('autoSync', value)}
            trackColor={{ false: Colors.gray[300], true: Colors.primary[300] }}
            thumbColor={settings.autoSync ? Colors.primary[500] : Colors.gray[100]}
            disabled={!isConnected}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Wifi size={20} color={Colors.warning[500]} />
            </View>
            <Text style={styles.settingLabel}>Sync Only on Wi-Fi</Text>
          </View>
          <Switch
            value={settings.syncOnlyOnWifi}
            onValueChange={(value) => updateSetting('syncOnlyOnWifi', value)}
            trackColor={{ false: Colors.gray[300], true: Colors.primary[300] }}
            thumbColor={settings.syncOnlyOnWifi ? Colors.primary[500] : Colors.gray[100]}
            disabled={!settings.autoSync || !isConnected}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.syncButton, !isConnected && styles.disabledButton]}
          onPress={handleSync}
          disabled={syncing || !isConnected}
        >
          {syncing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <RefreshCw size={20} color={Colors.white} style={styles.syncIcon} />
              <Text style={styles.syncButtonText}>Sync Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <HelpCircle size={20} color={Colors.primary[500]} />
            </View>
            <Text style={styles.settingLabel}>Help & Support</Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[500]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Info size={20} color={Colors.accent[500]} />
            </View>
            <Text style={styles.settingLabel}>About TrackRise</Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[500]} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton}>
        <LogOut size={20} color={Colors.error[500]} style={styles.logoutIcon} />
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  errorText: {
    fontFamily: FontConfig.subheading,
    fontSize: 18,
    color: Colors.error[600],
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Layout.spacing.l,
    paddingVertical: Layout.spacing.m,
    borderRadius: Layout.borderRadius.m,
  },
  retryButtonText: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 16,
    color: Colors.white,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: Layout.spacing.m,
    borderRadius: Layout.borderRadius.m,
    overflow: 'hidden',
    ...Layout.shadows.small,
  },
  sectionTitle: {
    fontFamily: FontConfig.subheading,
    fontSize: 16,
    color: Colors.gray[700],
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Layout.borderRadius.s,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.m,
  },
  settingLabel: {
    fontFamily: FontConfig.body,
    fontSize: 16,
    color: Colors.gray[900],
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontFamily: FontConfig.body,
    fontSize: 14,
    color: Colors.gray[600],
    marginRight: Layout.spacing.s,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Layout.spacing.m,
    paddingTop: Layout.spacing.s,
  },
  connectionStatusText: {
    fontFamily: FontConfig.body,
    fontSize: 12,
    color: Colors.gray[600],
    marginRight: Layout.spacing.xs,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectedIndicator: {
    backgroundColor: Colors.accent[500],
  },
  disconnectedIndicator: {
    backgroundColor: Colors.error[500],
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[500],
    paddingVertical: Layout.spacing.m,
    margin: Layout.spacing.m,
    borderRadius: Layout.borderRadius.m,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
  syncIcon: {
    marginRight: Layout.spacing.s,
  },
  syncButtonText: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 16,
    color: Colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Layout.spacing.m,
    margin: Layout.spacing.m,
    borderRadius: Layout.borderRadius.m,
    borderWidth: 1,
    borderColor: Colors.error[300],
    ...Layout.shadows.small,
  },
  logoutIcon: {
    marginRight: Layout.spacing.s,
  },
  logoutButtonText: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 16,
    color: Colors.error[500],
  },
  versionText: {
    fontFamily: FontConfig.body,
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    marginVertical: Layout.spacing.l,
  },
});