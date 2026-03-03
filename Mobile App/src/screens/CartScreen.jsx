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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { cart, loading, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleUpdateQty = async (productId, newQty) => {
    try {
      await updateQuantity(productId, newQty);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    let resolvedAddress = user?.address;
    if (user?.addresses && user.addresses.length > 0) {
      const defAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      resolvedAddress = `${defAddr.addressLine1}, ${defAddr.addressLine2 ? defAddr.addressLine2 + ', ' : ''}${defAddr.city || ''} ${defAddr.pincode || ''}`.trim();
    }

    if (!resolvedAddress) {
      Alert.alert('Address Required', 'Please set your delivery address in profile', [
        { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
        { text: 'Cancel', style: 'cancel' }
      ]);
      return;
    }

    setCheckingOut(true);
    try {
      await orderAPI.createOrder(resolvedAddress);
      Alert.alert('Success', 'Order placed successfully!', [
        { text: 'Track Order', onPress: () => navigation.navigate('Orders') }
      ]);
      await clearCart();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading && !cart) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  // Resolve address to display
  let displayAddress = user?.address || 'No address set. Please update in profile.';
  if (user?.addresses && user.addresses.length > 0) {
    const defAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
    displayAddress = `${defAddr.label ? `[${defAddr.label}] ` : ''}${defAddr.addressLine1}, ${defAddr.addressLine2 ? defAddr.addressLine2 + ', ' : ''}${defAddr.city || ''} ${defAddr.pincode || ''}`.trim();
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Shopping Cart</Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {isEmpty ? (
          <View className="flex-1 items-center justify-center pt-20 px-10">
            <View className="w-32 h-32 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <Icon name="shopping-cart" size={64} color="#FF6B6B" />
            </View>
            <Text className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</Text>
            <Text className="text-sm text-gray-500 text-center mb-8 leading-5">
              Looks like you haven't added anything yet
            </Text>
            <TouchableOpacity 
              className="bg-red-400 px-8 py-4 rounded-2xl"
              onPress={() => navigation.navigate('Home')}
            >
              <Text className="text-white font-bold text-base">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Address Section */}
            <View className="bg-white p-4 mx-4 mt-4 rounded-2xl border border-gray-100">
              <View className="flex-row items-center mb-2">
                <Icon name="location-on" size={20} color="#FF6B6B" />
                <Text className="text-sm font-bold text-gray-900 ml-1">Delivery Address</Text>
              </View>
              <Text className="text-sm text-gray-500 leading-tight" numberOfLines={2}>
                {displayAddress}
              </Text>
            </View>

            {/* Cart Items */}
            <View className="px-4 mt-6">
              {cart.items.map((item) => (
                <View key={item.product._id} className="flex-row items-center py-3 border-b border-gray-50">
                  <Image 
                    source={{ uri: item.product.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
                    className="w-20 h-20 rounded-xl bg-gray-50" 
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>{item.product.name}</Text>
                    <Text className="text-sm text-gray-500 mb-3">₹{item.product.price} / {item.product.unit}</Text>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center bg-red-50 rounded-lg p-1">
                        <TouchableOpacity 
                          className="p-1"
                          onPress={() => handleUpdateQty(item.product._id, item.quantity - 1)}
                        >
                          <Icon name="remove" size={18} color="#FF6B6B" />
                        </TouchableOpacity>
                        <Text className="text-base font-bold text-gray-900 mx-3">{item.quantity}</Text>
                        <TouchableOpacity 
                          className="p-1"
                          onPress={() => handleUpdateQty(item.product._id, item.quantity + 1)}
                        >
                          <Icon name="add" size={18} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-base font-bold text-gray-900">₹{item.product.price * item.quantity}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    className="p-2 ml-2"
                    onPress={() => handleUpdateQty(item.product._id, 0)}
                  >
                    <Icon name="delete-outline" size={22} color="#adb5bd" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Bill Details */}
            <View className="p-4 mx-4 mt-6 bg-gray-50 rounded-2xl">
              <Text className="text-base font-bold text-gray-900 mb-4">Bill Details</Text>
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-gray-500">Item Total</Text>
                <Text className="text-sm font-semibold text-gray-900">₹{cart.totalAmount}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-gray-500">Delivery Fee</Text>
                <Text className="text-sm font-bold text-green-500">FREE</Text>
              </View>
              <View className="h-px bg-gray-200 my-3" />
              <View className="flex-row justify-between">
                <Text className="text-base font-extrabold text-gray-900">To Pay</Text>
                <Text className="text-lg font-extrabold text-gray-900">₹{cart.totalAmount}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {!isEmpty && (
        <View className="absolute bottom-0 bg-white flex-row items-center px-4 pt-3 pb-8 border-t border-gray-100 justify-between w-full">
          <View className="flex-1">
            <Text className="text-xl font-extrabold text-gray-900">₹{cart.totalAmount}</Text>
            <Text className="text-[10px] font-bold text-red-400 mt-0.5">VIEW DETAILED BILL</Text>
          </View>
          <TouchableOpacity 
            className="flex-[1.5] bg-red-400 flex-row items-center justify-center py-4 rounded-2xl shadow-sm"
            onPress={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-base font-bold mr-1">Place Order (COD)</Text>
            )}
            <Icon name="keyboard-arrow-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;