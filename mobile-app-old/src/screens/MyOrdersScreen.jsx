import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { orderAPI, subscriptionAPI } from '../utils/api';

const MyOrdersScreen = ({ navigation, route }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(route.params?.tab || 'active');

  useEffect(() => {
    fetchData();
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route.params?.tab]);

  const fetchData = async () => {
    try {
      const [subsRes, ordersRes] = await Promise.all([
        subscriptionAPI.getMySubscriptions(),
        orderAPI.getMyOrders()
      ]);
      setSubscriptions((subsRes.data || []).filter(s => s.status !== 'cancelled'));
      // Filter for subscription-generated orders to show delivery history
      setDeliveryHistory((ordersRes.data || []).filter(o => o.orderType === 'Subscription-Generated'));
    } catch (error) {
      console.error('Failed to fetch subscription data', error);
      Alert.alert('Error', 'Could not load your subscriptions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePause = (id) => {
    Alert.alert(
      'Pause Subscription',
      'Are you sure you want to pause this subscription? You can resume it anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pause', 
          style: 'destructive',
          onPress: async () => {
             try {
               await subscriptionAPI.pauseSubscription(id);
               fetchData();
             } catch (e) {
               Alert.alert('Error', 'Failed to pause subscription');
             }
          }
        }
      ]
    );
  };

  const handleResume = async (id) => {
    try {
      await subscriptionAPI.resumeSubscription(id);
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Failed to resume subscription');
    }
  };

  const handleSkip = (id) => {
    Alert.alert('Skip Tomorrow', 'Are you sure you want to skip tomorrow\'s delivery?', [
      { text: 'Yes, Skip', onPress: () => skipTomorrow(id) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const skipTomorrow = async (id) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await subscriptionAPI.skipDate(id, tomorrow.toISOString());
      fetchData();
      Alert.alert('Skipped', 'Tomorrow\'s delivery has been skipped.');
    } catch (error) {
      Alert.alert('Error', 'Failed to skip delivery');
    }
  };

  const handleCancel = (id) => {
    Alert.alert(
      'Cancel Subscription',
      'This will stop all future deliveries for this product. Confirm?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
             try {
               await subscriptionAPI.cancelSubscription(id);
               fetchData();
             } catch (e) {
               Alert.alert('Error', 'Failed to cancel subscription');
             }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-600';
      case 'Cancelled': return 'text-red-600';
      case 'active': return 'text-white';
      case 'paused': return 'text-orange-500';
      default: return 'text-blue-600';
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-blue-900 ml-2">Delivery History</Text>
        </View>
        <TouchableOpacity 
          className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100"
          onPress={() => navigation.navigate('Products')}
        >
          <Text className="text-blue-900 font-extrabold text-xs">+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 py-4 bg-white">
        <TouchableOpacity 
          onPress={() => setActiveTab('active')}
          className={`flex-1 py-3 rounded-2xl items-center ${activeTab === 'active' ? 'bg-blue-900 shadow-md' : 'bg-transparent'}`}
        >
          <Text className={`font-black uppercase tracking-widest text-[10px] ${activeTab === 'active' ? 'text-white' : 'text-gray-400'}`}>Active Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('history')}
          className={`flex-1 py-3 rounded-2xl items-center ${activeTab === 'history' ? 'bg-blue-900 shadow-md' : 'bg-transparent'}`}
        >
          <Text className={`font-black uppercase tracking-widest text-[10px] ${activeTab === 'history' ? 'text-white' : 'text-gray-400'}`}>Delivery History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e3a8a']} />}
      >
        <View className="px-6 mt-6">
          {activeTab === 'active' ? (
            subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <View key={sub._id} className="bg-white rounded-[40px] overflow-hidden border border-gray-100 mb-6 shadow-sm">
                   <View className="p-6">
                     <View className="flex-row justify-between items-start mb-6">
                       <View className="flex-row items-center">
                         <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                           <Icon name="local-drink" size={32} color="#1e3a8a" />
                         </View>
                         <View>
                           <Text className="text-lg font-black text-blue-950">{sub.product.name}</Text>
                           <View className={`self-start px-2 py-1 rounded-md mt-1 ${sub.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`}>
                              <Text className="text-[8px] font-black text-white uppercase">{sub.status}</Text>
                           </View>
                         </View>
                       </View>
                        <Text className="text-xl font-black text-blue-900">₹{sub.product.price} <Text className="text-[10px] font-bold text-gray-400">/ {sub.product.unit}</Text></Text>
                     </View>

                     <View className="bg-gray-50 rounded-3xl p-5 mb-6 border border-gray-100">
                        <View className="flex-row justify-between mb-3">
                          <Text className="text-xs font-bold text-gray-500">Daily Quantity</Text>
                          <Text className="text-xs font-black text-blue-900">{sub.quantity} {sub.product.unit}</Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                          <Text className="text-xs font-bold text-gray-500">Total Per Day</Text>
                          <Text className="text-sm font-black text-blue-950">₹{sub.product.price * sub.quantity}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-xs font-bold text-gray-500">Starts From</Text>
                          <Text className="text-xs font-black text-blue-900">{new Date(sub.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                        </View>
                     </View>

                     <View className="flex-row gap-2">
                        {sub.status === 'active' ? (
                          <TouchableOpacity 
                            onPress={() => handlePause(sub._id)}
                            className="flex-1 bg-orange-500 py-4 rounded-2xl items-center"
                          >
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">Pause</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity 
                            onPress={() => handleResume(sub._id)}
                            className="flex-1 bg-green-600 py-4 rounded-2xl items-center"
                          >
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">Resume</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          onPress={() => handleSkip(sub._id)}
                          className="flex-1 bg-blue-50 border border-blue-100 py-4 rounded-2xl items-center"
                        >
                          <Text className="text-blue-900 text-[10px] font-black uppercase tracking-widest">Skip Tomorrow</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleCancel(sub._id)}
                          className="flex-1 bg-white border border-gray-100 py-4 rounded-2xl items-center"
                        >
                          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Cancel</Text>
                        </TouchableOpacity>
                     </View>
                   </View>
                </View>
              ))
            ) : (
              <View className="items-center py-20 bg-white rounded-[40px] border border-gray-100 border-dashed">
                <Icon name="event-note" size={64} color="#cbd5e1" />
                <Text className="text-blue-950 font-black text-lg mt-4">No Active Subscriptions</Text>
                <Text className="text-gray-400 font-bold mt-2 text-center px-10">Choose from our range of premium dairy products to start your morning fresh.</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Products')}
                  className="mt-8 bg-blue-900 px-8 py-4 rounded-2xl"
                >
                  <Text className="text-white font-black uppercase tracking-widest">Browse Products</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            deliveryHistory.length > 0 ? (
              deliveryHistory.map((order) => (
                <View key={order._id} className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-xs flex-row items-center">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${order.status === 'Delivered' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Icon 
                      name={order.status === 'Delivered' ? 'check-circle' : 'cancel'} 
                      size={24} 
                      color={order.status === 'Delivered' ? '#16a34a' : '#dc2626'} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-black text-blue-950">{order.items[0]?.product.name || 'Dairy Delivery'}</Text>
                    <Text className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-black text-blue-900">₹{order.totalAmount}</Text>
                    <Text className={`text-[8px] font-black uppercase ${getStatusColor(order.status)}`}>{order.status}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="items-center py-20">
                <Icon name="history" size={64} color="#cbd5e1" />
                <Text className="text-gray-400 font-bold mt-4">No delivery history available yet</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyOrdersScreen;
