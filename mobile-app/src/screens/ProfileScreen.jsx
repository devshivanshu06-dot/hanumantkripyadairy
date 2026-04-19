import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../utils/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
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

  const userData = {
    name: user?.name || 'Loading...',
    phone: user?.phone || '...',
    email: user?.email || 'No email set',
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const handlePress = (item) => {
    if (item.screen === 'Rate') {
      Alert.alert('Rate Us', 'Your feedback helps us grow! Would you like to rate us on the Play Store?', [
        { text: 'Later', style: 'cancel' },
        { text: 'Sure!', onPress: () => {} }
      ]);
      return;
    }
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FE]">
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
                
                <View className="flex-row items-center">
                   <View className="bg-green-700 px-3 py-1 rounded-md flex-row items-center mr-3">
                      <Icon name="check" size={14} color="white" />
                      <Text className="text-white text-[10px] font-black uppercase ml-1">Verified</Text>
                   </View>
                </View>
             </View>
          </View>
       </View>

       <ScrollView 
         className="-mt-8"
         contentContainerStyle={{ paddingBottom: 100 }} 
         showsVerticalScrollIndicator={false}
       >
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
               title: 'Delivery History', 
               subtitle: 'View orders and plans', 
               icon: 'event-available', 
               color: '#16a34a', 
               screen: 'Delivery' 
             },
             { 
               id: '3', 
               title: 'Wallet Balance', 
               subtitle: `₹${balance.toFixed(2)}`, 
               icon: 'credit-card', 
               color: '#1e3a8a', 
               screen: 'Wallet' 
             },
             { id: '4', title: 'Notifications', subtitle: 'View recent updates', icon: 'notifications', color: '#1e3a8a', screen: 'Notifications' },
             { id: '5', title: 'Help & Support', subtitle: 'Get assistance', icon: 'headset-mic', color: '#1e3a8a', screen: 'Support' },
             { id: '6', title: 'About Us', subtitle: 'Our mission', icon: 'info', color: '#64748b', screen: 'About' },
             { id: '8', title: 'Privacy Policy', subtitle: 'Your data security', icon: 'security', color: '#1e293b', screen: 'PrivacyPolicy' },
             { id: '7', title: 'Rate Us', subtitle: 'Share your feedback', icon: 'star', color: '#eab308', screen: 'Rate' },
           ].map((item) => (
             <TouchableOpacity
               key={item.id}
               className="bg-white mb-4 rounded-2xl p-4 flex-row items-center shadow-sm border border-gray-100"
               onPress={() => handlePress(item)}
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