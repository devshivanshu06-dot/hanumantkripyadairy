import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SupportScreen = ({ navigation }) => {
  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=919999999999&text=Hello, I need help with my Hanumant Kripaya account.');
  };

  const callSupport = () => {
    Linking.openURL('tel:+919999999999');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-2xl">
          <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 ml-4">Help & Support</Text>
      </View>

      <ScrollView className="p-6">
        <View className="bg-white rounded-[32px] p-8 items-center shadow-sm border border-gray-100 mb-8">
           <View className="bg-blue-50 w-20 h-20 rounded-full items-center justify-center mb-6">
              <Icon name="headset-mic" size={40} color="#1e3a8a" />
           </View>
           <Text className="text-2xl font-black text-blue-950 text-center mb-2">How can we help?</Text>
           <Text className="text-gray-400 font-bold text-center">Our team is available 24/7 to ensure you get your fresh dairy on time.</Text>
        </View>

        <TouchableOpacity 
          onPress={openWhatsApp}
          className="bg-green-500 p-6 rounded-[24px] flex-row items-center mb-4 shadow-lg shadow-green-200"
        >
           <Icon name="chat" size={24} color="white" />
           <View className="ml-4 flex-1">
              <Text className="text-white font-black text-lg">WhatsApp Support</Text>
              <Text className="text-white/80 text-xs font-bold">Fastest way to reach us</Text>
           </View>
           <Icon name="chevron-right" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={callSupport}
          className="bg-white p-6 rounded-[24px] flex-row items-center mb-4 shadow-sm border border-gray-100"
        >
           <Icon name="call" size={24} color="#1e3a8a" />
           <View className="ml-4 flex-1">
              <Text className="text-blue-900 font-black text-lg">Call Us</Text>
              <Text className="text-gray-400 text-xs font-bold">+91 99999 99999</Text>
           </View>
           <Icon name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

        <View className="mt-8">
           <Text className="text-lg font-black text-blue-950 mb-4 px-2">Common FAQs</Text>
           {[
             'How to pause delivery?',
             'Refund policy for cancelled orders',
             'Changing delivery address',
             'Wallet recharge issues'
           ].map((faq, i) => (
             <TouchableOpacity key={i} className="bg-white p-5 rounded-2xl mb-3 flex-row justify-between items-center border border-gray-100">
                <Text className="text-gray-700 font-bold text-sm">{faq}</Text>
                <Icon name="add" size={20} color="#94a3b8" />
             </TouchableOpacity>
           ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportScreen;
