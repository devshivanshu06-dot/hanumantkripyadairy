import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { subscriptionAPI } from '../utils/api';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const SubscriptionConfirmScreen = ({ navigation, route }) => {
  const { product, quantity, frequency, timeSlot } = route.params;
  const [loading, setLoading] = useState(false);

  const dailyAmount = product.price * quantity;
  const monthlyAmount = dailyAmount * 30; // Rough estimate for display

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const subData = {
        product: product._id,
        quantity,
        frequency,
        timeSlot,
        startDate: new Date(),
      };
      await subscriptionAPI.createSubscription(subData);
      Alert.alert('Success', 'Subscription active! Fresh milk will reach you daily.', [
        { text: 'View Delivery History', onPress: () => navigation.navigate('MainTabs', { screen: 'Delivery' }) },
        { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-2xl">
          <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 ml-4 tracking-tight">Confirm Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 mb-8">
          <View className="items-center mb-8">
            <View className="w-32 h-32 bg-blue-50 rounded-[32px] items-center justify-center mb-4 border border-blue-100">
              <Image 
                source={{ uri: product.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>
            <Text className="text-2xl font-black text-blue-950">{product.name}</Text>
            <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{product.category}</Text>
          </View>

          <View className="space-y-4 pt-6 border-t border-gray-50">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 font-bold">Quantity</Text>
              <Text className="text-blue-950 font-black">{quantity} {product.unit} (Every Day)</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 font-bold">Frequency</Text>
              <Text className="text-blue-950 font-black capitalize">{frequency}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 font-bold">Time Slot</Text>
              <Text className="text-blue-950 font-black">{timeSlot}</Text>
            </View>
          </View>
        </View>

        <Text className="text-lg font-black text-blue-950 mb-4 ml-2">Payment Breakdown</Text>
        <LinearGradient
          colors={['#1e3a8a', '#1e40af']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[32px] p-8 shadow-xl shadow-blue-200"
        >
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Daily Amount</Text>
              <Text className="text-white text-3xl font-black">₹{dailyAmount.toFixed(2)}</Text>
            </View>
            <View className="bg-white/20 p-3 rounded-2xl">
              <Icon name="today" size={24} color="white" />
            </View>
          </View>
          
          <View className="h-[1px] bg-white/10 mb-6" />

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Estimated Monthly (30 Days)</Text>
              <Text className="text-white text-xl font-bold">₹{monthlyAmount.toFixed(2)}</Text>
            </View>
            <View className="bg-white/10 px-3 py-1 rounded-lg">
               <Text className="text-white text-[8px] font-black uppercase">Wallet Based</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="mt-8 bg-orange-50 p-4 rounded-2xl border border-orange-100 flex-row items-start">
           <Icon name="info" size={20} color="#d97706" />
           <Text className="text-[11px] font-bold text-orange-700 ml-3 flex-1 leading-4">
             Amount will be automatically deducted from your wallet on each delivery. Please ensure you have sufficient balance.
           </Text>
        </View>
      </ScrollView>

      <View className="p-8 bg-white border-t border-gray-50">
        <TouchableOpacity 
          className="bg-blue-900 py-5 rounded-2xl flex-row items-center justify-center shadow-xl shadow-blue-200"
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Icon name="check-circle" size={22} color="white" />
              <Text className="text-white text-lg font-black ml-2 uppercase tracking-widest">Confirm & Start</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionConfirmScreen;
