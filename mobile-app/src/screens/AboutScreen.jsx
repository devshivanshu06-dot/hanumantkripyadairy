import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AboutScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-2xl">
          <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 ml-4">About Us</Text>
      </View>

      <ScrollView className="p-8">
        <View className="items-center mb-10">
           <View className="w-24 h-24 bg-blue-900 rounded-[32px] items-center justify-center shadow-xl shadow-blue-200 mb-6">
              <Icon name="milk" size={48} color="white" />
           </View>
           <Text className="text-3xl font-black text-blue-950">Hanumant Kripaya</Text>
           <Text className="text-blue-900 font-bold tracking-[3px] uppercase mt-1">Pure Dairy Enterprise</Text>
        </View>

        <View className="space-y-6">
           <View>
              <Text className="text-lg font-black text-blue-950 mb-2">Our Mission</Text>
              <Text className="text-gray-500 font-bold leading-6">
                To provide the purest, unadulterated farm-fresh milk and dairy products directly to your doorstep within hours of production, ensuring health and vitality for every family.
              </Text>
           </View>

           <View>
              <Text className="text-lg font-black text-blue-950 mb-4">Why Choose Us?</Text>
              {[
                { icon: 'verified', title: '100% Pure', desc: 'No additives or preservatives ever.' },
                { icon: 'speed', title: 'Farm to Home', desc: 'Delivered within 6-12 hours of milking.' },
                { icon: 'fact-check', title: 'Quality Checks', desc: 'Rigorous testing for fat, SNF and Ph.' }
              ].map((item, i) => (
                <View key={i} className="flex-row items-start mb-5">
                   <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-4">
                      <Icon name={item.icon} size={20} color="#1e3a8a" />
                   </View>
                   <View className="flex-1">
                      <Text className="text-blue-950 font-black mb-0.5">{item.title}</Text>
                      <Text className="text-gray-400 font-bold text-xs">{item.desc}</Text>
                   </View>
                </View>
              ))}
           </View>
        </View>

        <Text className="text-center text-[10px] font-black text-gray-300 mt-20 mb-10 uppercase tracking-[4px]">
           Copyright © 2024 Hanumant Kripaya Dairy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
