import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { productAPI, subscriptionAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { cartCount, addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsRes, subsRes] = await Promise.all([
        productAPI.getProducts(),
        subscriptionAPI.getMySubscriptions()
      ]);
      setProducts(productsRes.data);
      setSubscriptions(subsRes.data);
    } catch (error) {
      console.error('Failed to fetch home data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-3xl w-44 mr-5 p-4 shadow-sm border border-gray-100"
      onPress={() => navigation.navigate('Products', { product: item })}
      activeOpacity={0.9}
    >
      <View className="h-28 bg-gray-50 rounded-2xl justify-center items-center mb-4 relative">
        <Image 
          source={{ uri: item.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
          className="w-20 h-20 resize-contain" 
        />
        {item.isSubscriptionAvailable && (
          <View className="absolute top-2 right-2 bg-gray-900 px-2 py-1 rounded-md">
            <Text className="text-white text-[10px] font-black tracking-wider uppercase">Sub</Text>
          </View>
        )}
      </View>
      
      <View>
        <Text className="text-sm font-extrabold text-gray-900 mb-1" numberOfLines={1}>{item.name}</Text>
        <Text className="text-lg font-black text-red-400 mb-1">
          ₹{item.price} <Text className="text-xs font-semibold text-gray-400">/ {item.unit}</Text>
        </Text>
        
        <TouchableOpacity 
          className="mt-3 bg-red-50 border-2 border-red-100 py-3 rounded-xl items-center active:bg-red-100"
          onPress={() => {
            if (item.isSubscriptionAvailable) {
              navigation.navigate('Products', { product: item });
            } else {
              addToCart(item._id, 1);
            }
          }}
        >
          <Text className="text-red-500 text-xs font-black uppercase tracking-widest">
            {item.isSubscriptionAvailable ? 'View Plan' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  let displayAddress = user?.address || 'Set your address';
  if (user?.addresses && user.addresses.length > 0) {
    const defAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
    displayAddress = `${defAddr.label ? `[${defAddr.label}] ` : ''}${defAddr.addressLine1}, ${defAddr.city || ''}`.trim();
  }

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-white z-10">
        <View className="flex-1 mr-4">
          <Text className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
            Namaste, {user?.name?.split(' ')[0] || 'User'}! 👋
          </Text>
          <View className="flex-row items-center">
            <Icon name="location-on" size={16} color="#ef4444" />
            <Text className="text-sm font-semibold text-gray-500 ml-1" numberOfLines={1}>
              {displayAddress}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')}
          className="w-12 h-12 bg-gray-50 rounded-full justify-center items-center border border-gray-100 active:bg-gray-100"
        >
          <Icon name="shopping-cart" size={24} color="#1f2937" />
          {cartCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full justify-center items-center border-2 border-white">
              <Text className="text-white text-[10px] font-black">{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Active Subscriptions */}
        {subscriptions.filter(s => s.status === 'active').length > 0 && (
          <View className="mt-6 mb-2">
            <Text className="text-xl font-black text-gray-900 px-6 mb-5 tracking-tight">Your Daily Deliveries</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
              {subscriptions.filter(s => s.status === 'active').map((sub) => (
                <TouchableOpacity 
                  key={sub._id}
                  className="mr-4 rounded-3xl overflow-hidden shadow-sm"
                  onPress={() => navigation.navigate('Schedule')}
                >
                  <LinearGradient
                    colors={['#f43f5e', '#fb7185']}
                    className="p-5 w-56"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View className="flex-row items-center mb-3">
                      <Icon name="local-drink" size={24} color="white" />
                      <Text className="text-white text-lg font-black ml-2 tracking-tight" numberOfLines={1}>{sub.product.name}</Text>
                    </View>
                    <Text className="text-white/90 text-sm font-bold bg-black/10 self-start px-3 py-1.5 rounded-xl">
                      {sub.quantity} {sub.product.unit} • {sub.timeSlot}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Promo Banner */}
        <TouchableOpacity className="mx-6 mt-6 rounded-3xl overflow-hidden shadow-sm active:opacity-90">
          <LinearGradient
            colors={['#1f2937', '#374151']}
            className="p-6 flex-row justify-between items-center"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="flex-1">
              <Text className="text-white text-2xl font-black mb-1 tracking-tight">Fresh Milk Daily</Text>
              <Text className="text-gray-300 text-sm font-semibold mb-5">Pure, Organic & Untouched</Text>
              <View className="bg-red-500 self-start px-5 py-2.5 rounded-xl">
                <Text className="text-white text-xs font-black uppercase tracking-widest">Subscribe Now</Text>
              </View>
            </View>
            <View className="bg-white/10 p-4 rounded-full ml-4">
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }}
                className="w-16 h-16"
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories (Static) */}
        <View className="mt-10">
          <Text className="text-xl font-black text-gray-900 px-6 mb-5 tracking-tight">Shop by Category</Text>
          <View className="flex-row justify-between px-6">
            {['Milk', 'Curd', 'Paneer', 'Ghee'].map((cat) => (
              <TouchableOpacity 
                key={cat} 
                className="items-center active:opacity-75"
                onPress={() => navigation.navigate('Category', { category: cat })}
              >
                <View className="w-16 h-16 rounded-2xl bg-orange-50 items-center justify-center mb-3 border border-orange-100 shadow-sm">
                  <Icon name={cat === 'Milk' ? 'local-drink' : 'shopping-basket'} size={28} color="#f97316" />
                </View>
                <Text className="text-sm font-extrabold text-gray-700 tracking-tight">{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Products */}
        <View className="mt-10">
          <View className="flex-row justify-between items-center px-6 mb-5">
            <Text className="text-xl font-black text-gray-900 tracking-tight">Popular Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text className="text-red-500 font-bold tracking-tight">See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;