import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { fonts } from '@/constants/FontConfig';
import { initDatabase } from '@/utils/database';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import FontConfig from '@/constants/FontConfig';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts(fonts);

  // Initialize database
  useEffect(() => {
    const initApp = async () => {
      try {
        await initDatabase();
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbError('Failed to initialize the app database');
      }
    };

    initApp();
  }, []);

  // Hide splash screen once everything is loaded
  useEffect(() => {
    if ((fontsLoaded || fontError) && (isDbInitialized || dbError)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isDbInitialized, dbError]);

  // Return null to keep splash screen visible while loading
  if (!fontsLoaded || !isDbInitialized) {
    return null;
  }

  // Show error screen if there was a problem
  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{dbError}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: FontConfig.bodyMedium,
    fontSize: 16,
    color: Colors.error[600],
    textAlign: 'center',
  },
});