import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, setIsLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(false);

  // Use dummy data mixed with real user context since full backend stats might not exist yet
  const userData = {
    name: user?.name || 'Loading...',
    phone: user?.phone || '...',
    email: user?.email || 'No email set',
    membership: 'Gold Member',
    joinedDate: 'Jan 15, 2024',
    totalOrders: 24,
    totalSpent: 3250,
  };

  const menuItems = [
    { id: '1', title: 'My Orders', icon: 'receipt', color: '#3b82f6', screen: 'Orders' },
    { id: '2', title: 'Delivery Addresses', icon: 'location-on', color: '#ef4444', screen: 'Addresses' },
    { id: '3', title: 'Payment Methods', icon: 'payment', color: '#10b981', screen: 'Payments' },
    { id: '4', title: 'Schedule Management', icon: 'calendar-today', color: '#8b5cf6', screen: 'Schedule' },
    { id: '5', title: 'Notifications', icon: 'notifications', color: '#f59e0b', screen: 'Notifications' },
    { id: '6', title: 'Help & Support', icon: 'help-center', color: '#14b8a6', screen: 'Support' },
    { id: '7', title: 'About Us', icon: 'info', color: '#64748b', screen: 'About' },
    { id: '8', title: 'Rate Us', icon: 'star', color: '#eab308', screen: 'Rate' },
  ];

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('token');
            // Hard reload app state if needed, AuthContext usually handles it
            Alert.alert('Logged Out', 'You will be returned to the login screen.', [
              {text: 'Ok', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
            ]);
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
          <Icon name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-gray-900 tracking-tight">Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="p-2 -mr-2 rounded-full active:bg-gray-100">
          <Icon name="settings" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white mx-5 mt-6 rounded-3xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-6">
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
              className="w-20 h-20 rounded-full bg-gray-50 mr-5 border-2 border-gray-100"
            />
            <View className="flex-1">
              <Text className="text-2xl font-black text-gray-900 mb-1" numberOfLines={1}>{userData.name}</Text>
              <Text className="text-base font-semibold text-gray-500 mb-0.5">{userData.phone}</Text>
              <Text className="text-sm font-medium text-gray-400 mb-3" numberOfLines={1}>{userData.email}</Text>
              <View className="flex-row items-center bg-yellow-50 self-start px-3 py-1.5 rounded-full border border-yellow-100">
                <Icon name="verified" size={14} color="#d97706" />
                <Text className="text-xs font-bold text-yellow-700 ml-1.5">{userData.membership}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <View className="flex-1 items-center">
              <Text className="text-xl font-black text-gray-900 mb-1">{userData.totalOrders}</Text>
              <Text className="text-xs font-semibold text-gray-500 text-center">Total Orders</Text>
            </View>
            <View className="w-px h-full bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-xl font-black text-gray-900 mb-1">₹{userData.totalSpent}</Text>
              <Text className="text-xs font-semibold text-gray-500 text-center">Total Spent</Text>
            </View>
            <View className="w-px h-full bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-sm font-black text-gray-900 mb-2 mt-1">{userData.joinedDate}</Text>
              <Text className="text-xs font-semibold text-gray-500 text-center">Member Since</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="bg-white mx-5 mt-5 rounded-3xl p-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-extrabold text-gray-900 mb-5 tracking-tight">Quick Settings</Text>
          
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 rounded-2xl bg-orange-50 items-center justify-center mr-4">
                <Icon name="notifications" size={24} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-0.5">Notifications</Text>
                <Text className="text-xs font-medium text-gray-500">Receive order updates & offers</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#e2e8f0', true: '#f97316' }}
              thumbColor="#fff"
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mr-4">
                <Icon name="auto-schedule" size={24} color="#a855f7" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-0.5">Auto Schedule</Text>
                <Text className="text-xs font-medium text-gray-500">Automatically renew deliveries</Text>
              </View>
            </View>
            <Switch
              value={autoSchedule}
              onValueChange={setAutoSchedule}
              trackColor={{ false: '#e2e8f0', true: '#a855f7' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white mx-5 mt-5 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center px-6 py-4 bg-white active:bg-gray-50 ${index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
              onPress={() => {
                if (['Orders', 'Addresses', 'Schedule'].includes(item.screen)) {
                  navigation.navigate(item.screen);
                } else {
                  Alert.alert('Coming Soon', `${item.title} screen is under construction.`);
                }
              }}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${item.color}15` }}>
                <Icon name={item.icon} size={20} color={item.color} />
              </View>
              <Text className="flex-1 text-base font-bold text-gray-800 tracking-tight">{item.title}</Text>
              <Icon name="chevron-right" size={24} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity 
          className="mx-5 mt-6 mb-8 bg-white py-4 rounded-2xl flex-row items-center justify-center shadow-sm border border-gray-100 active:bg-gray-50"
          onPress={handleLogout}
        >
          <Icon name="logout" size={20} color="#ef4444" />
          <Text className="text-base font-bold text-red-500 ml-2">Logout Securely</Text>
        </TouchableOpacity>

        <Text className="text-center text-xs font-semibold text-gray-400 mb-8 tracking-widest uppercase">
          Hanumant Kripya Dairy v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;