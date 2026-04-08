import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { subscriptionAPI } from '../utils/api';

const ProductScreen = ({ navigation, route }) => {
  const product = route?.params?.product;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState('Morning');
  const [frequency, setFrequency] = useState('daily');



  const handleSubscribe = () => {
    navigation.navigate('SubscriptionConfirm', {
      product,
      quantity,
      frequency,
      timeSlot
    });
  };

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center p-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Icon name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2 text-gray-900">Products</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-500">Products screen coming soon.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-2xl">
          <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 ml-4 tracking-tight">Product Details</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <View className="h-80 bg-white justify-center items-center rounded-b-[48px] shadow-sm overflow-hidden mb-6">
          <Image 
            source={{ uri: product.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
            className="w-64 h-64 resize-contain" 
          />
        </View>

        <View className="px-6">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-3xl font-black text-blue-950 mb-1">{product.name}</Text>
              <View className="bg-blue-50 self-start px-3 py-1 rounded-lg border border-blue-100">
                <Text className="text-blue-900 font-black text-[10px] uppercase tracking-widest">{product.category}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-black text-blue-900">₹{product.price}</Text>
              <Text className="text-xs font-bold text-gray-400">/ {product.unit}</Text>
            </View>
          </View>
          
          <Text className="text-base text-gray-500 font-bold leading-6 mt-6 mb-8">
            {product.description || 'Experience the purity of farm-fresh dairy delivered straight to your doorstep within hours of milking.'}
          </Text>

          <View className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm mb-6">
            <Text className="text-base font-black text-blue-950 mb-4">Quantity per day</Text>
            <View className="flex-row items-center bg-gray-50 p-2 rounded-2xl w-48 justify-between border border-gray-100">
              <TouchableOpacity 
                className="w-12 h-12 bg-white rounded-xl shadow-sm items-center justify-center border border-gray-100" 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon name="remove" size={24} color="#1e3a8a" />
              </TouchableOpacity>
              <Text className="text-2xl font-black text-blue-900">{quantity}</Text>
              <TouchableOpacity 
                className="w-12 h-12 bg-white rounded-xl shadow-sm items-center justify-center border border-gray-100" 
                onPress={() => setQuantity(quantity + 1)}
              >
                <Icon name="add" size={24} color="#1e3a8a" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-base font-black text-blue-950 mb-4">Delivery Slot</Text>
            <View className="flex-row gap-3">
              {['Morning', 'Evening'].map(slot => (
                <TouchableOpacity 
                  key={slot} 
                  className={`flex-1 py-4 rounded-2xl border-2 items-center ${timeSlot === slot ? 'border-blue-900 bg-blue-50' : 'border-gray-100 bg-white'}`}
                  onPress={() => setTimeSlot(slot)}
                >
                  <View className="flex-row items-center gap-2">
                    <Icon name={slot === 'Morning' ? 'wb-sunny' : 'nights-stay'} size={18} color={timeSlot === slot ? '#1e3a8a' : '#94a3b8'} />
                    <Text className={`font-black ${timeSlot === slot ? 'text-blue-900' : 'text-slate-400'}`}>{slot}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-base font-black text-blue-950 mb-4">Frequency</Text>
            <View className="flex-row gap-3">
              {[
                { id: 'daily', label: 'Every Day' },
                { id: 'alternate', label: 'Alternate Days' }
              ].map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  className={`flex-1 py-4 rounded-2xl border-2 items-center ${frequency === item.id ? 'border-blue-900 bg-blue-50' : 'border-gray-100 bg-white'}`}
                  onPress={() => setFrequency(item.id)}
                >
                  <Text className={`font-black ${frequency === item.id ? 'text-blue-900' : 'text-slate-400'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full p-8 bg-white border-t border-gray-50 rounded-t-[40px] shadow-2xl">
        <TouchableOpacity 
          className="bg-blue-900 py-5 rounded-2xl flex-row items-center justify-center shadow-xl shadow-blue-200"
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Icon name="event-repeat" size={22} color="white" />
              <Text className="text-white text-lg font-black ml-2 uppercase tracking-widest">Subscribe Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductScreen;