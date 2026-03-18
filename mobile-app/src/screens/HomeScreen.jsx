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
import { productAPI, subscriptionAPI, bannerAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsRes, subsRes, bannersRes] = await Promise.all([
        productAPI.getProducts(),
        subscriptionAPI.getMySubscriptions(),
        bannerAPI.getActiveBanners()
      ]);
      setProducts(productsRes.data);
      setSubscriptions(subsRes.data);
      if (bannersRes.data) {
        setBanners(bannersRes.data);
      }
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
        {/* Promo Banner Slider (Top-most) */}
        <View className="mb-6">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="w-full">
            {banners.length > 0 ? (
                banners.map((item, index) => (
                    <TouchableOpacity key={item._id} className="w-[100vw] px-6 active:opacity-90">
                        <View className="h-44 w-full rounded-3xl overflow-hidden shadow-sm border border-blue-200">
                           <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                           <LinearGradient
                             colors={['transparent', 'rgba(0,0,0,0.6)']}
                             className="absolute inset-0 flex-col justify-end p-5"
                           >
                              <Text className="text-white text-xl font-black mb-1">{item.title}</Text>
                              <TouchableOpacity className="bg-blue-900 self-start px-4 py-2 rounded-xl">
                                <Text className="text-white text-[10px] font-black uppercase">Subscribe Now</Text>
                              </TouchableOpacity>
                           </LinearGradient>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                /* Fallback Slider */
                [1, 2, 3].map((i) => (
                  <TouchableOpacity key={i} className="w-[100vw] px-6 active:opacity-90">
                    <View className="h-44 w-full rounded-3xl overflow-hidden shadow-sm border border-blue-200 bg-blue-50 justify-center items-center">
                       <Icon name="photo-library" size={48} color="#1e3a8a" />
                       <Text className="text-blue-900 font-bold mt-2">Special Offers will appear here</Text>
                    </View>
                  </TouchableOpacity>
                ))
            )}
          </ScrollView>
          <View className="flex-row justify-center mt-3 gap-1">
            {(banners.length > 0 ? banners : [1, 2, 3]).map((i, idx) => (
              <View key={idx} className={`h-1.5 rounded-full ${idx === 0 ? 'w-4 bg-blue-900' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </View>
        </View>

        {/* Active Subscription (Image 2 style) */}
        {subscriptions.filter(s => s.status === 'active').length > 0 ? (
          <View className="px-6 mb-8">
            <Text className="text-xl font-black text-gray-900 mb-4">Cow Milk Subscription</Text>
            {subscriptions.filter(s => s.status === 'active').slice(0, 1).map((sub) => (
              <TouchableOpacity key={sub._id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-blue-50 h-52">
                <Image 
                  source={{ uri: 'https://img.freepik.com/free-photo/fresh-milk-glass-wooden-table_1150-17631.jpg' }} 
                  className="absolute inset-0 w-full h-full"
                  resizeMode="cover"
                />
                <LinearGradient
                   colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.7)', 'transparent']}
                   className="absolute inset-0 p-6"
                   start={{ x: 0, y: 0.5 }}
                   end={{ x: 1, y: 0.5 }}
                >
                   <View className="flex-row items-center mb-3">
                      <View className="w-5 h-5 bg-green-500 rounded-full items-center justify-center mr-2">
                        <Icon name="check" size={14} color="white" />
                      </View>
                      <Text className="text-base font-bold text-blue-900">{sub.quantity} {sub.product.unit} Every Day</Text>
                   </View>
                   <View className="flex-row items-center mb-4">
                      <View className="w-5 h-5 bg-green-500 rounded-full items-center justify-center mr-2">
                        <Icon name="check" size={14} color="white" />
                      </View>
                      <Text className="text-base font-bold text-blue-900">Starts Tomorrow</Text>
                   </View>
                   <Text className="text-xl font-bold text-blue-950">Total Cost: ₹{sub.product.price * sub.quantity} / Day</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Live Transparency Feed Placeholder */}
        <View className="mt-8 px-6">
          <View className="bg-[#1e3a8a] rounded-t-2xl p-4">
            <Text className="text-white text-lg font-bold">Live Transparency Feed</Text>
          </View>
          <View className="bg-white border border-gray-200 border-t-0 rounded-b-2xl p-4 flex-row justify-between">
            <View className="flex-1 mr-2 relative">
                <View className="h-32 bg-gray-100 rounded-xl justify-center items-center overflow-hidden">
                    <Image source={{uri: 'https://images.unsplash.com/photo-1550583724-125581f77833?q=80&w=1000&auto=format&fit=crop'}} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded">
                        <Text className="text-white font-black text-[8px]">LIVE</Text>
                    </View>
                    <View className="absolute bottom-0 bg-black/60 px-2 py-1 w-full">
                        <Text className="text-white text-[10px] text-center font-bold">Fat: 4.7% SNF: 8.4%</Text>
                    </View>
                </View>
            </View>
            <View className="flex-1 ml-2 relative">
                <View className="h-32 bg-gray-100 rounded-xl justify-center items-center overflow-hidden">
                    <Image source={{uri: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=1000&auto=format&fit=crop'}} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded">
                        <Text className="text-white font-black text-[8px]">LIVE</Text>
                    </View>
                    <View className="absolute bottom-0 bg-black/60 px-2 py-1 w-full">
                        <Text className="text-white text-[10px] text-center font-bold">Packing Fresh Milk</Text>
                    </View>
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
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <Text key={d} className="text-xs font-black text-blue-900 w-8 text-center">{d}</Text>
                ))}
              </View>
              
              <View className="flex-row flex-wrap justify-between">
                {[...Array(14)].map((_, i) => {
                  const day = i + 1;
                  let bgClass = "bg-white";
                  let textClass = "text-gray-400";
                  let icon = null;

                  if (day >= 8 && day <= 11) { // Delivered
                    bgClass = "bg-green-600";
                    textClass = "text-white";
                    icon = "check-circle";
                  } else if (day === 12) { // Missed
                    bgClass = "bg-green-700/80";
                    textClass = "text-white";
                    icon = "block";
                  } else if (day > 12 && day < 18) { // Scheduled
                    bgClass = "bg-blue-600";
                    textClass = "text-white";
                  } else if (day === 19) { // Missed Red
                      bgClass = "bg-red-500";
                      textClass = "text-white";
                  }

                  return (
                    <View key={i} className={`w-9 h-9 items-center justify-center rounded-lg mb-2 ${bgClass} ${day >= 8 && day <= 14 ? 'shadow-sm' : 'border border-gray-50'}`}>
                      {icon ? (
                        <View className="items-center">
                          <Text className="text-[8px] font-black text-white">{day}</Text>
                          <Icon name={icon} size={10} color="white" />
                        </View>
                      ) : (
                        <Text className={`text-xs font-bold ${textClass}`}>{day}</Text>
                      )}
                    </View>
                  );
                })}
              </View>

              <View className="flex-row justify-between mt-4">
                 <TouchableOpacity className="flex-1 bg-blue-900 py-3 rounded-xl mr-2 items-center">
                    <Text className="text-white text-xs font-black">Manage Subscription</Text>
                 </TouchableOpacity>
                 <TouchableOpacity className="flex-1 bg-white border border-gray-200 py-3 rounded-xl ml-2 items-center">
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
          <FlatList
            data={products}
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
        </View>

        {/* Upcoming Products (Image 3 style) */}
        <View className="mt-8 px-6 pb-10">
          <View className="mb-5">
            <Text className="text-xl font-black text-blue-950 tracking-tight">Upcoming Products</Text>
            <View className="h-1 w-12 bg-blue-900 mt-1 rounded-full" />
          </View>
          
          <View className="flex-row justify-between flex-wrap">
            {[
              { name: 'Dahi', image: 'https://cdn-icons-png.flaticon.com/512/2311/2311894.png' },
              { name: 'Paneer', image: 'https://cdn-icons-png.flaticon.com/512/5701/5701383.png' },
              { name: 'Ghee', image: 'https://cdn-icons-png.flaticon.com/512/10753/10753086.png' },
            ].map((prod) => (
              <View 
                key={prod.name} 
                className="w-[30%] bg-white rounded-3xl p-3 border border-gray-100 shadow-sm items-center mb-4"
              >
                <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center mb-2 overflow-hidden">
                   <Image source={{ uri: prod.image }} className="w-10 h-10" />
                </View>
                <Text className="text-xs font-black text-blue-950 mb-3">{prod.name}</Text>
                <TouchableOpacity className="bg-green-600 px-2 py-1.5 rounded-lg flex-row items-center">
                  <Text className="text-[8px] font-black text-white uppercase">Notify Me</Text>
                  <Icon name="check" size={10} color="white" style={{marginLeft: 2}} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;