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
import YoutubePlayer from 'react-native-youtube-iframe';
import { productAPI, subscriptionAPI, bannerAPI, customerAPI, walletAPI, orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [banners, setBanners] = useState([]);
  const [livestreams, setLivestreams] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [orders, setOrders] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsRes, subsRes, bannersRes, livestreamsRes, walletRes, ordersRes] = await Promise.all([
        productAPI.getProducts(),
        subscriptionAPI.getMySubscriptions(),
        bannerAPI.getActiveBanners(),
        customerAPI.getLivestreams(),
        walletAPI.getBalance().catch(() => ({ data: { balance: 0 } })),
        orderAPI.getMyOrders().catch(() => ({ data: [] }))
      ]);
      setProducts(productsRes.data);
      setSubscriptions(subsRes.data);
      setOrders(ordersRes.data || []);
      if (bannersRes.data) {
        setBanners(bannersRes.data);
      }
      if (livestreamsRes.data) {
        setLivestreams(livestreamsRes.data);
      }
      setWalletBalance(walletRes.data.balance);
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
        <View className="absolute top-2 right-2 bg-gray-900 px-2 py-1 rounded-md">
          <Text className="text-white text-[10px] font-black tracking-wider uppercase">Sub</Text>
        </View>
      </View>
      
      <View>
        <Text className="text-sm font-extrabold text-gray-900 mb-1" numberOfLines={1}>{item.name}</Text>
        <Text className="text-lg font-black text-blue-900 mb-1">
          ₹{item.price} <Text className="text-xs font-semibold text-gray-400">/ {item.unit}</Text>
        </Text>
        
        <TouchableOpacity 
          className="mt-3 bg-blue-900 py-3 rounded-xl items-center active:bg-blue-800"
          onPress={() => navigation.navigate('Products', { product: item })}
        >
          <Text className="text-white text-xs font-black uppercase tracking-widest">
            Subscribe
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
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-3 bg-white border-b border-gray-50">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center overflow-hidden border border-blue-100">
             <Image 
               source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3039/3039396.png' }} 
               className="w-10 h-10" 
               resizeMode="contain"
             />
          </View>
          <Text className="text-xl font-black text-blue-900 ml-3 tracking-tight">
            Hanumant Kripa Dairy
          </Text>
        </View>
        <TouchableOpacity className="p-2 bg-gray-50 rounded-full border border-gray-100">
          <Icon name="notifications" size={24} color="#1e3a8a" />
          <View className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e3a8a']} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Welcome Section */}
        <View className="px-6 pt-6 pb-2">
           <Text className="text-2xl font-black text-blue-950">Welcome {user?.name?.split(' ')[0] || 'User'}!</Text>
        </View>
        <View className="mb-6">
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false} 
            className="w-full"
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveIndex(Math.round(x / width));
            }}
            scrollEventThrottle={16}
          >
            {(banners.length > 0 ? banners : [1, 2, 3]).map((item, index) => (
                    <TouchableOpacity key={item._id || index} className="w-[100vw] px-6 active:opacity-95">
                        <View className="h-44 w-full rounded-[32px] overflow-hidden shadow-xl shadow-blue-100 border border-blue-100 bg-blue-50">
                           {item.image ? (
                             <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                           ) : (
                             <View className="flex-1 justify-center items-center">
                               <Icon name="photo-library" size={48} color="#1e3a8a" />
                               <Text className="text-blue-900 font-black mt-2">Special Offer {index + 1}</Text>
                             </View>
                           )}
                           {/* Overlay removed as requested */}
                           {/* Overlay removed as requested */}
                           <View className="absolute inset-x-0 bottom-0 p-6">
                           </View>
                        </View>
                    </TouchableOpacity>
                ))
            }
          </ScrollView>
          <View className="flex-row justify-center mt-4 gap-1.5">
            {(banners.length > 0 ? banners : [1, 2, 3]).map((_, idx) => (
              <View 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-6 bg-blue-900' : 'w-1.5 bg-gray-300'}`} 
              />
            ))}
          </View>
        </View>

        
        {/* Live Transparency Feed (YouTube Embed) */}
        <View className="mt-8 px-6">
          <View className="bg-[#1e3a8a] rounded-t-3xl p-5 flex-row justify-between items-center">
            <View>
              <Text className="text-white text-lg font-black tracking-tight">Live Transparency Feed</Text>
              <Text className="text-blue-200 text-[10px] font-bold uppercase">Real-time Quality Monitoring</Text>
            </View>
          </View>
          <View className="bg-white border border-gray-100 border-t-0 rounded-b-3xl overflow-hidden shadow-sm">
            <View className="h-56 w-full bg-black">
               {livestreams?.youtube_url ? (
                 <YoutubePlayer
                    height={230}
                    play={false}
                    videoId={livestreams.youtube_url.includes('v=') 
                      ? livestreams.youtube_url.split('v=')[1]?.split('&')[0] 
                      : livestreams.youtube_url.split('/').pop()}
                 />
               ) : (
                 <View className="flex-1 justify-center items-center">
                    <Icon name="videocam-off" size={48} color="#334155" />
                    <Text className="text-gray-500 font-bold mt-2">Livestream offline</Text>
                 </View>
               )}
            </View>
            <View className="p-4 flex-row justify-between bg-blue-50/30">
                <View className="items-center flex-1 border-r border-blue-100">
                    <Text className="text-blue-900 font-black text-xs">Fat: {livestreams?.fat || '0'}%</Text>
                    <Text className="text-[8px] font-bold text-gray-500 uppercase">Current Batch</Text>
                </View>
                <View className="items-center flex-1 border-r border-blue-100">
                    <Text className="text-blue-900 font-black text-xs">SNF: {livestreams?.snf || '0'}%</Text>
                    <Text className="text-[8px] font-bold text-gray-500 uppercase">Purity Level</Text>
                </View>
                <View className="items-center flex-1">
                    <Text className="text-blue-900 font-black text-xs">Ph: {livestreams?.ph || '0'}</Text>
                    <Text className="text-[8px] font-bold text-gray-500 uppercase">Freshness</Text>
                </View>
            </View>
          </View>
        </View>

        {/* Track Daily Deliveries (Calendar) - Image 2 style */}
        <View className="mt-8 px-6">
           <View className="flex-row justify-between items-center mb-4">
             <Text className="text-xl font-black text-blue-950">Track Daily Deliveries</Text>
             <View className="h-0.5 flex-1 bg-gray-100 ml-4" />
           </View>
           
           <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <View className="flex-row justify-between mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
                  <Text key={`${d}-${index}`} className="text-xs font-black text-blue-900 w-8 text-center">{d}</Text>
                ))}
              </View>
              
              <View className="flex-row flex-wrap justify-between">
                {[...Array(7)].map((_, i) => {
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  
                  const targetDay = new Date(startOfWeek);
                  targetDay.setDate(startOfWeek.getDate() + i);
                  
                  const dayNum = targetDay.getDate();
                  const dateStr = targetDay.toISOString().split('T')[0];
                  
                  // Check if there was a delivery on this date
                  const deliveryOnThisDay = orders.find(o => 
                    o.orderType === 'Subscription-Generated' && 
                    new Date(o.createdAt).toISOString().split('T')[0] === dateStr
                  );
                  
                  let bgClass = "bg-white";
                  let textClass = "text-gray-400";
                  let icon = null;

                  if (deliveryOnThisDay) {
                    if (deliveryOnThisDay.status === 'Delivered') {
                      bgClass = "bg-green-600";
                      textClass = "text-white";
                      icon = "check-circle";
                    } else if (deliveryOnThisDay.status === 'Cancelled') {
                      bgClass = "bg-red-500";
                      textClass = "text-white";
                      icon = "block";
                    } else {
                      bgClass = "bg-blue-600";
                      textClass = "text-white";
                    }
                  } else if (targetDay < today) {
                      // Past day with no delivery record
                      bgClass = "bg-gray-100";
                      textClass = "text-gray-300";
                  } else if (targetDay.toDateString() === today.toDateString()) {
                      // Today
                      bgClass = "bg-blue-50 border-blue-200 border";
                      textClass = "text-blue-900";
                  }

                  return (
                    <View key={i} className={`w-9 h-9 items-center justify-center rounded-lg mb-2 ${bgClass} shadow-sm`}>
                      {icon ? (
                        <View className="items-center">
                          <Text className="text-[8px] font-black text-white">{dayNum}</Text>
                          <Icon name={icon} size={10} color="white" />
                        </View>
                      ) : (
                        <Text className={`text-xs font-bold ${textClass}`}>{dayNum}</Text>
                      )}
                    </View>
                  );
                })}
              </View>

              <View className="flex-row justify-between mt-4">
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Subscription')}
                    className="flex-1 bg-blue-900 py-3 rounded-xl mr-2 items-center"
                  >
                     <Text className="text-white text-xs font-black">Manage Subscription</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Subscription', { screen: 'Subscription', params: { tab: 'history' } })} 
                    className="flex-1 bg-white border border-gray-200 py-3 rounded-xl ml-2 items-center"
                  >
                     <Text className="text-gray-700 text-xs font-black">View History</Text>
                  </TouchableOpacity>
              </View>
           </View>
        </View>

        {/* Products (Fresh Milk) */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-6 mb-5">
            <View>
              <Text className="text-xl font-black text-blue-950 tracking-tight">Fresh Milk</Text>
              <View className="h-1 w-8 bg-blue-900 mt-1 rounded-full" />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text className="text-blue-900 font-black text-sm uppercase tracking-tighter">View All</Text>
            </TouchableOpacity>
          </View>
          {products.filter(p => p.category?.toLowerCase() === 'milk' || p.name?.toLowerCase().includes('milk')).length > 0 ? (
            <FlatList
              data={products.filter(p => p.category?.toLowerCase() === 'milk' || p.name?.toLowerCase().includes('milk'))}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-white rounded-[32px] w-48 mr-5 overflow-hidden shadow-sm border border-gray-100"
                  onPress={() => navigation.navigate('Products', { product: item })}
                  activeOpacity={0.9}
                >
                  <View className="h-40 bg-gray-50 relative">
                    <Image 
                      source={{ uri: item.image || 'https://cdn-icons-png.flaticon.com/512/3039/3039396.png' }} 
                      className="w-full h-full" 
                      resizeMode="cover"
                    />
                  </View>
                  
                  <View className="p-5 pt-4">
                    <Text className="text-base font-black text-blue-950 mb-1" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-lg font-black text-blue-900 mb-4">
                      ₹{item.price} <Text className="text-xs font-bold text-gray-400">/ {item.unit}</Text>
                    </Text>
                    
                    <TouchableOpacity 
                      className="bg-blue-900 py-3 rounded-2xl items-center shadow-lg shadow-blue-200"
                      onPress={() => navigation.navigate('Products', { product: item })}
                    >
                      <Text className="text-white text-xs font-black uppercase tracking-widest">
                        Subscribe
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 15 }}
            />
          ) : (
            <View className="px-6 py-10 bg-blue-50/50 rounded-3xl mx-6 items-center border border-blue-100 border-dashed">
                <Icon name="info-outline" size={32} color="#1e3a8a" />
                <Text className="text-blue-900 font-bold mt-2 text-center">No fresh milk products available currently. Check back soon!</Text>
            </View>
          )}
        </View>

        {/* Upcoming Products removed as requested */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;