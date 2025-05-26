import React from 'react';
import { Tabs } from 'expo-router';
import { ChartBar as BarChart2, Plus, Settings, ListOrdered } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import FontConfig from '@/constants/FontConfig';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.gray[200],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: FontConfig.body,
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: Colors.primary[500],
        },
        headerTitleStyle: {
          fontFamily: FontConfig.heading,
          fontSize: 18,
          color: Colors.white,
        },
        headerTintColor: Colors.white,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <BarChart2 size={size} color={color} />
          ),
          headerTitle: 'TrackRise',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <ListOrdered size={size} color={color} />
          ),
          headerTitle: 'Transactions',
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => (
            <Plus
              size={26}
              color={Colors.white}
              style={{
                backgroundColor: Colors.primary[500],
                borderRadius: Layout.borderRadius.circle,
                padding: 8,
                overflow: 'hidden',
              }}
            />
          ),
          tabBarLabelStyle: {
            display: 'none',
          },
          headerTitle: 'Add Transaction',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}