import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const AboutScreen = ({ navigation }) => {
  const features = [
    { icon: 'event-repeat', text: 'Subscribe to daily milk delivery' },
    { icon: 'account-balance-wallet', text: 'Track orders and payments' },
    { icon: 'videocam', text: 'Watch daily milk testing and packing videos' },
    { icon: 'connected-tv', text: 'Stay connected with our transparent dairy system' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-50">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center"
        >
          <Icon name="arrow-back-ios" size={18} color="#1e3a8a" style={{ marginLeft: 5 }} />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 ml-4 tracking-tight">About Us</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#1e3a8a', '#1e40af']}
          className="p-10 items-center overflow-hidden"
          style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
        >
          <View className="w-24 h-24 bg-white/20 rounded-[32px] items-center justify-center border border-white/30 mb-6">
             <Icon name="water-drop" size={48} color="white" />
          </View>
          <Text className="text-3xl font-black text-white text-center">About Hanumant Kripa Dairy</Text>
          <View className="h-1 w-12 bg-blue-300 mt-4 rounded-full" />
        </LinearGradient>

        <View className="px-8 mt-10">
          <Text className="text-gray-800 text-lg font-black leading-7 mb-6 text-center">
            Hanumant Kripa Dairy is committed to delivering 100% pure and fresh milk directly to your doorstep with complete transparency and trust.
          </Text>

          <View className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 mb-10">
            <Text className="text-gray-500 font-bold leading-6 text-center">
              We source milk daily from local farmers and ensure hygienic processing, proper chilling, and safe packaging before delivery. Our mission is not just to sell milk, but to build trust and long-term relationships with our customers.
            </Text>
          </View>

          {/* App Features */}
          <Text className="text-xl font-black text-blue-950 mb-6 tracking-tight">With our mobile app, you can:</Text>
          <View className="space-y-5 mb-10">
            {features.map((item, index) => (
              <View key={index} className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-4">
                  <Icon name={item.icon} size={20} color="#1e3a8a" />
                </View>
                <Text className="flex-1 text-gray-700 font-bold text-sm">{item.text}</Text>
              </View>
            ))}
          </View>

          {/* Motto Section */}
          <View className="bg-gray-900 p-8 rounded-[40px] items-center mb-10">
             <Text className="text-blue-400 text-[10px] font-black uppercase tracking-[4px] mb-4">We believe in</Text>
             <Text className="text-white text-xl font-black text-center tracking-widest">
               Shuddhata • Seva • Vishwas
             </Text>
          </View>

          {/* Final Statement */}
          <View className="items-center px-4">
             <View className="w-10 h-1 h-1 bg-blue-100 mb-6 rounded-full" />
             <Text className="text-gray-400 font-bold text-center leading-6 italic">
               "Our goal is to provide safe, pure, and reliable dairy products for every family."
             </Text>
          </View>
        </View>

        <Text className="text-center text-[10px] font-black text-gray-300 mt-16 mb-6 uppercase tracking-[4px]">
           Copyright © 2026 Hanumant Kripaya Dairy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
