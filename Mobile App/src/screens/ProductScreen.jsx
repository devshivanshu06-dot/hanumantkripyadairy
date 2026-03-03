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
import { useCart } from '../context/CartContext';
import { subscriptionAPI } from '../utils/api';

const ProductScreen = ({ navigation, route }) => {
  const product = route?.params?.product;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState('Morning');
  const [frequency, setFrequency] = useState('daily');

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(product._id, quantity);
      Alert.alert('Success', 'Added to cart successfully!', [
        { text: 'View Cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
        { text: 'Continue Shopping', style: 'cancel' }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
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
        { text: 'My Subscriptions', onPress: () => navigation.navigate('Schedule') },
        { text: 'OK' }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Product Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })} className="p-2 bg-gray-50 rounded-full">
          <Icon name="shopping-cart" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="h-72 bg-gray-50 justify-center items-center rounded-b-3xl mb-4">
          <Image 
            source={{ uri: product.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
            className="w-56 h-56 items-center justify-center resize-contain" 
          />
        </View>

        <View className="px-6 py-4">
          <Text className="text-2xl font-extrabold text-gray-900 mb-2">{product.name}</Text>
          <Text className="text-2xl font-extrabold text-red-400 mb-4">
            ₹{product.price} <Text className="text-sm text-gray-400 font-medium">/ {product.unit}</Text>
          </Text>
          
          <Text className="text-base text-gray-600 leading-6 mb-8">
            {product.description || 'Fresh and pure dairy product sourced organically.'}
          </Text>

          <View className="mb-8">
            <Text className="text-base font-bold text-gray-900 mb-4">Select Quantity</Text>
            <View className="flex-row items-center bg-gray-50 p-2 rounded-2xl w-40 justify-between">
              <TouchableOpacity className="p-2 bg-white rounded-xl shadow-sm" onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Icon name="remove" size={24} color="#FF6B6B" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900">{quantity}</Text>
              <TouchableOpacity className="p-2 bg-white rounded-xl shadow-sm" onPress={() => setQuantity(quantity + 1)}>
                <Icon name="add" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          {product.isSubscriptionAvailable && (
            <>
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-900 mb-4">Delivery Slot</Text>
                <View className="flex-row gap-3">
                  {['Morning', 'Evening'].map(slot => (
                    <TouchableOpacity 
                      key={slot} 
                      className={`flex-1 py-4 rounded-2xl border-2 items-center ${timeSlot === slot ? 'border-red-400 bg-red-50' : 'border-gray-100 bg-white'}`}
                      onPress={() => setTimeSlot(slot)}
                    >
                      <Text className={`font-bold ${timeSlot === slot ? 'text-red-500' : 'text-gray-600'}`}>{slot}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-base font-bold text-gray-900 mb-4">Frequency</Text>
                <View className="flex-row gap-3">
                  {['daily', 'alternate'].map(freq => (
                    <TouchableOpacity 
                      key={freq} 
                      className={`flex-1 py-4 rounded-2xl border-2 items-center ${frequency === freq ? 'border-red-400 bg-red-50' : 'border-gray-100 bg-white'}`}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text className={`font-bold ${frequency === freq ? 'text-red-500' : 'text-gray-600'}`}>
                        {freq === 'daily' ? 'Daily' : 'Alternate'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full p-6 bg-white border-t border-gray-100 shadow-lg">
        {product.isSubscriptionAvailable ? (
          <TouchableOpacity 
            className="bg-red-400 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-red-200"
            onPress={handleSubscribe}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Icon name="event-repeat" size={20} color="white" />
                <Text className="text-white text-lg font-bold ml-2">Start Subscription</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="bg-red-400 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-red-200"
            onPress={handleAddToCart}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Icon name="add-shopping-cart" size={20} color="white" />
                <Text className="text-white text-lg font-bold ml-2">Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProductScreen;