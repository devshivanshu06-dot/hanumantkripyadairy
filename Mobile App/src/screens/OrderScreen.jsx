import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { orderAPI } from '../utils/api';

const OrderScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past'

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'Out for Delivery': return { bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'Packed': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'Pending': return { bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'Cancelled': return { bg: 'bg-red-100', text: 'text-red-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'upcoming') {
      return ['Pending', 'Packed', 'Out for Delivery'].includes(order.status);
    } else {
      return ['Delivered', 'Cancelled'].includes(order.status);
    }
  });

  const renderOrderItem = ({ item }) => {
    const statusTheme = getStatusColor(item.status);
    
    return (
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <View className={`px-2 py-1 rounded-md self-start ${statusTheme.bg} mb-2`}>
              <Text className={`text-xs font-bold ${statusTheme.text}`}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-gray-500">Order #{item._id.substring(item._id.length - 6)}</Text>
            <Text className="text-xs text-gray-400 mt-1">
              {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <Text className="text-lg font-extrabold text-gray-900">₹{item.totalAmount}</Text>
        </View>

        <View className="h-px bg-gray-100 my-2" />

        <View className="mb-2">
          {item.items.map((opt, idx) => (
            <View key={idx} className="flex-row justify-between py-1">
              <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>
                {opt.quantity} x {opt.product?.name || 'Product'}
              </Text>
              <Text className="text-sm font-semibold text-gray-500">₹{opt.priceAtBooking * opt.quantity}</Text>
            </View>
          ))}
        </View>

        {item.orderType === 'Subscription-Generated' && (
          <View className="flex-row items-center mt-2 bg-blue-50 p-2 rounded-lg">
            <Icon name="repeat" size={14} color="#3b82f6" />
            <Text className="text-xs font-medium text-blue-600 ml-1">Automated Delivery</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-100 shadow-sm flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-gray-900">Your Orders</Text>
        <View className="w-6" />
      </View>

      <View className="flex-row px-4 py-3 bg-white">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-xl items-center ${activeTab === 'upcoming' ? 'bg-red-50' : 'bg-transparent'}`}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text className={`font-bold ${activeTab === 'upcoming' ? 'text-red-500' : 'text-gray-500'}`}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 rounded-xl items-center ${activeTab === 'past' ? 'bg-red-50' : 'bg-transparent'}`}
          onPress={() => setActiveTab('past')}
        >
          <Text className={`font-bold ${activeTab === 'past' ? 'text-red-500' : 'text-gray-500'}`}>Past</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <View className="bg-red-50 w-24 h-24 rounded-full items-center justify-center mb-4">
              <Icon name="receipt" size={48} color="#FF6B6B" />
            </View>
            <Text className="text-lg font-bold text-gray-800 mb-2">No orders found</Text>
            <Text className="text-sm text-gray-500 text-center px-10 mb-6">
              You don't have any {activeTab} orders at the moment.
            </Text>
            <TouchableOpacity 
              className="bg-red-400 px-6 py-3 rounded-full shadow-sm"
              onPress={() => navigation.navigate('Home')}
            >
              <Text className="text-white font-bold">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default OrderScreen;