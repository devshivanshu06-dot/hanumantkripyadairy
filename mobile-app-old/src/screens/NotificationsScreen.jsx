import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { notificationAPI } from '../utils/api';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data);
      // Mark as read when opening history
      await notificationAPI.markAsRead();
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getTimeAgo = (dateValue) => {
    const now = new Date();
    const date = new Date(dateValue);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'low_balance': return { name: 'warning', color: '#f59e0b' };
      case 'order_update': return { name: 'check-circle', color: '#10b981' };
      case 'wallet_update': return { name: 'account-balance-wallet', color: '#1e3a8a' };
      default: return { name: 'notifications', color: '#64748b' };
    }
  };

  const renderItem = ({ item }) => {
    const icon = getIcon(item.type);
    return (
      <View className={`bg-white p-5 rounded-3xl mb-4 flex-row items-start shadow-sm border ${item.isRead ? 'border-gray-50' : 'border-blue-100'}`}>
         <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${icon.color}10` }}>
            <Icon name={icon.name} size={24} color={icon.color} />
         </View>
         <View className="flex-1">
            <View className="flex-row justify-between mb-1">
               <View className="flex-row items-center">
                 <Text className="text-base font-black text-blue-950">{item.title}</Text>
                 {!item.isRead && <View className="w-2 h-2 bg-blue-600 rounded-full ml-2" />}
               </View>
               <Text className="text-[10px] font-bold text-gray-400 uppercase">{getTimeAgo(item.createdAt)}</Text>
            </View>
            <Text className="text-gray-500 font-bold text-xs leading-5">{item.message}</Text>
         </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-2xl">
          <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 ml-4">Notifications</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-32">
               <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                 <Icon name="notifications-none" size={40} color="#d1d5db" />
               </View>
               <Text className="text-gray-400 font-black tracking-widest uppercase text-center">No notifications yet</Text>
               <Text className="text-gray-400 text-xs mt-1">We'll let you know when something important happens.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
