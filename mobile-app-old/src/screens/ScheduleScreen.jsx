import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { subscriptionAPI } from '../utils/api';

const ScheduleScreen = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getMySubscriptions();
      setSubscriptions(response.data.filter(s => s.status !== 'cancelled'));
    } catch (error) {
      console.error('Failed to fetch subscriptions', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePause = async (id) => {
    Alert.alert('Pause Subscription', 'How many days would you like to pause?', [
      { text: '3 Days', onPress: () => pauseSub(id, 3) },
      { text: '7 Days', onPress: () => pauseSub(id, 7) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const pauseSub = async (id, days) => {
    try {
      const pausedUntil = new Date();
      pausedUntil.setDate(pausedUntil.getDate() + days);
      await subscriptionAPI.pauseSubscription(id, pausedUntil);
      fetchSubscriptions();
      Alert.alert('Paused', `Subscription paused until ${pausedUntil.toLocaleDateString()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to pause subscription');
    }
  };

  const handleResume = async (id) => {
    try {
      await subscriptionAPI.resumeSubscription(id);
      fetchSubscriptions();
      Alert.alert('Resumed', 'Your subscription is back to active!');
    } catch (error) {
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
      fetchSubscriptions();
      Alert.alert('Skipped', 'Tomorrow\'s delivery has been skipped.');
    } catch (error) {
      Alert.alert('Error', 'Failed to skip delivery');
    }
  };

  const handleCancel = (id) => {
    Alert.alert('Cancel Subscription', 'Are you sure? You will miss your fresh milk!', [
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelSub(id) },
      { text: 'No, Keep it', style: 'cancel' }
    ]);
  };

  const cancelSub = async (id) => {
    try {
      await subscriptionAPI.cancelSubscription(id);
      fetchSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription');
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
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-50 shadow-sm z-10">
        <Text className="text-xl font-black text-blue-900 tracking-tight">My Subscriptions</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSubscriptions(); }} colors={['#1e3a8a']} />}
      >
        <View className="px-6 pt-6">
          {subscriptions.length === 0 ? (
            <View className="items-center justify-center mt-32 px-10">
              <View className="bg-blue-50 w-24 h-24 rounded-full items-center justify-center mb-6">
                <Icon name="event-busy" size={48} color="#1e3a8a" />
              </View>
              <Text className="text-2xl font-black text-blue-950 mb-2">No Active Plans</Text>
              <Text className="text-gray-400 font-bold text-center">Subscribe to our pure dairy products for daily doorstep delivery.</Text>
            </View>
          ) : (
            subscriptions.map((sub) => (
              <View key={sub._id} className={`bg-white rounded-[32px] p-6 mb-4 shadow-sm border ${sub.status === 'paused' ? 'border-orange-100 bg-orange-50/30' : 'border-gray-100'}`}>
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row flex-1">
                    <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4 border border-blue-100">
                       <Image 
                         source={{ uri: sub.product.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
                         className="w-10 h-10"
                         resizeMode="contain"
                       />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-black text-blue-950">{sub.product.name}</Text>
                      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {sub.quantity} {sub.product.unit} • {sub.frequency} • {sub.timeSlot}
                      </Text>
                    </View>
                  </View>
                  <View className={`px-3 py-1 rounded-lg ${sub.status === 'active' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-[10px] font-black uppercase ${sub.status === 'active' ? 'text-green-700' : 'text-orange-700'}`}>
                      {sub.status}
                    </Text>
                  </View>
                </View>

                {sub.status === 'paused' && sub.pausedUntil && (
                  <View className="flex-row items-center bg-white p-3 rounded-xl mb-4 border border-orange-100">
                    <Icon name="pause-circle-filled" size={16} color="#d97706" />
                    <Text className="text-xs font-bold text-orange-700 ml-2">
                      Resuming on {new Date(sub.pausedUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                )}

                <View className="flex-row gap-3">
                  {sub.status === 'active' ? (
                    <TouchableOpacity 
                      className="flex-1 flex-row items-center justify-center bg-orange-50 py-3.5 rounded-2xl border border-orange-100" 
                      onPress={() => handlePause(sub._id)}
                    >
                      <Icon name="pause" size={18} color="#d97706" />
                      <Text className="text-orange-700 font-black text-xs ml-1 uppercase">Pause</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      className="flex-1 flex-row items-center justify-center bg-green-50 py-3.5 rounded-2xl border border-green-100" 
                      onPress={() => handleResume(sub._id)}
                    >
                      <Icon name="play-arrow" size={18} color="#15803d" />
                      <Text className="text-green-700 font-black text-xs ml-1 uppercase">Resume</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    className="flex-1 flex-row items-center justify-center bg-blue-50 py-3.5 rounded-2xl border border-blue-100" 
                    onPress={() => handleSkip(sub._id)}
                  >
                    <Icon name="event-busy" size={18} color="#1e3a8a" />
                    <Text className="text-blue-900 font-black text-xs ml-1 uppercase">Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="bg-gray-50 px-4 items-center justify-center rounded-2xl border border-gray-200" 
                    onPress={() => handleCancel(sub._id)}
                  >
                    <Icon name="delete-outline" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        className="absolute bottom-24 right-6 w-16 h-16 rounded-full bg-blue-900 justify-center items-center shadow-xl shadow-blue-200" 
        onPress={() => navigation.navigate('Home')}
      >
        <Icon name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ScheduleScreen;