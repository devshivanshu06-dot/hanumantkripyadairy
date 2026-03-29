import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../utils/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [balance, setBalance] = useState(0);

  React.useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const balanceRes = await walletAPI.getBalance();
      setBalance(balanceRes.data.balance);
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  };

  // Use dummy data mixed with real user context since full backend stats might not exist yet
  const userData = {
    name: user?.name || 'Loading...',
    phone: user?.phone || '...',
    email: user?.email || 'No email set',
    membership: 'Gold Member',
    joinedDate: 'Jan 15, 2024',
    totalOrders: 24,
    totalSpent: 3250,
  };

  const menuItems = [
    { id: '2', title: 'Delivery Addresses', icon: 'location-on', color: '#ef4444', screen: 'Addresses' },
    { id: '3', title: 'Payment Methods', icon: 'payment', color: '#10b981', screen: 'Payments' },
    { id: '4', title: 'Schedule Management', icon: 'calendar-today', color: '#8b5cf6', screen: 'Schedule' },
    { id: '5', title: 'Notifications', icon: 'notifications', color: '#f59e0b', screen: 'Notifications' },
    { id: '6', title: 'Help & Support', icon: 'help-center', color: '#14b8a6', screen: 'Support' },
    { id: '7', title: 'About Us', icon: 'info', color: '#64748b', screen: 'About' },
    { id: '8', title: 'Rate Us', icon: 'star', color: '#eab308', screen: 'Rate' },
  ];

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('token');
            // Hard reload app state if needed, AuthContext usually handles it
            Alert.alert('Logged Out', 'You will be returned to the login screen.', [
              {text: 'Ok', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
            ]);
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FE]">
       {/* Custom Header with Background */}
       <View className="relative h-64">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop' }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.95)']}
            className="absolute inset-0"
          />
          
          <View className="absolute inset-0 pt-10 px-8 flex-row items-center">
             <View className="relative shadow-2xl">
               <Image
                 source={{ uri: 'https://media.istockphoto.com/id/1270067126/photo/smiling-indian-man-looking-at-camera.jpg?s=612x612&w=0&k=20&c=ovIQO3_yHbs989bi889Y6C9R_9Aki9167H58O60p-H0=' }}
                 className="w-24 h-24 rounded-full border-4 border-white"
               />
             </View>
             <View className="ml-5 flex-1 pt-4">
                <Text className="text-2xl font-black text-blue-950">{userData.name}</Text>
                <Text className="text-base font-bold text-blue-900 mb-2">{userData.phone}</Text>
                <Text className="text-xs font-semibold text-blue-900/60 mb-3">{userData.email}</Text>
                
                <View className="flex-row items-center">
                   <View className="bg-green-700 px-3 py-1 rounded-md flex-row items-center mr-3">
                      <Icon name="check" size={14} color="white" />
                      <Text className="text-white text-[10px] font-black uppercase ml-1">Verified</Text>
                   </View>
                   <TouchableOpacity className="bg-orange-100 px-3 py-1 rounded-md flex-row items-center border border-orange-200">
                      <Icon name="edit" size={14} color="#d97706" />
                      <Text className="text-orange-700 text-[10px] font-black uppercase ml-1">Edit Profile</Text>
                   </TouchableOpacity>
                </View>
             </View>
          </View>
       </View>

       <ScrollView 
         className="-mt-8"
         contentContainerStyle={{ paddingBottom: 100 }} 
         showsVerticalScrollIndicator={false}
       >
         {/* Menu Items as per Image 1 */}
         <View className="px-5">
           {[
             { 
               id: '1', 
               title: 'Delivery Address', 
               subtitle: user?.addresses?.find(a => a.isDefault)?.addressLine1 || user?.addresses?.[0]?.addressLine1 || 'No address set', 
               icon: 'home', 
               color: '#1e3a8a', 
               screen: 'Addresses' 
             },
             { 
               id: '2', 
               title: 'Subscription Plan', 
               subtitle: 'View active plans', 
               icon: 'event-available', 
               color: '#16a34a', 
               screen: 'Schedule' 
             },
             { 
               id: '3', 
               title: 'Wallet Balance', 
               subtitle: `₹${balance.toFixed(2)}`, 
               icon: 'credit-card', 
               color: '#1e3a8a', 
               screen: 'Wallet' 
             },
             { id: '4', title: 'My Orders', subtitle: 'View order history', icon: 'inventory-2', color: '#1e3a8a', screen: 'My Orders' },
             { id: '5', title: 'Help & Support', subtitle: 'Get assistance', icon: 'headset-mic', color: '#1e3a8a', screen: 'Support' },
           ].map((item) => (
             <TouchableOpacity
               key={item.id}
               className="bg-white mb-4 rounded-2xl p-4 flex-row items-center shadow-sm border border-gray-100"
               onPress={() => item.screen && navigation.navigate(item.screen)}
             >
               <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${item.color}10` }}>
                 <Icon name={item.icon} size={24} color={item.color} />
               </View>
               <View className="flex-1">
                 <Text className="text-base font-black text-blue-950">{item.title}</Text>
                 <Text className="text-xs font-bold text-gray-500" numberOfLines={1}>{item.subtitle}</Text>
               </View>
               <Icon name="chevron-right" size={24} color="#d1d5db" />
             </TouchableOpacity>
           ))}
           
           <TouchableOpacity 
             className="mt-4 bg-white py-4 rounded-full flex-row items-center justify-center shadow-sm border border-gray-100 active:bg-gray-50"
             onPress={handleLogout}
           >
             <Icon name="power-settings-new" size={24} color="#991b1b" />
             <Text className="text-lg font-black text-[#991b1b] ml-2">Log Out</Text>
           </TouchableOpacity>
         </View>

         <Text className="text-center text-[10px] font-black text-gray-400 mt-10 tracking-[4px] uppercase">
           Hanumant Kripaya v1.0.0
         </Text>
       </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;