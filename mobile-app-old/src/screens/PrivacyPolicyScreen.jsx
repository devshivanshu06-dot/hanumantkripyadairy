import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const PrivacyPolicyScreen = ({ navigation }) => {
  const sections = [
    {
      title: 'Information We Collect',
      icon: 'contact-page',
      points: [
        'Name, phone number, and address',
        'Order and subscription details',
        'Payment information (handled securely via payment gateway)'
      ]
    },
    {
      title: 'How We Use Your Data',
      icon: 'insights',
      points: [
        'To deliver milk and manage subscriptions',
        'To send order updates and notifications',
        'To improve our services'
      ]
    },
    {
      title: 'Data Protection',
      icon: 'gpp-good',
      content: 'We do not sell or share your personal data with third parties except for delivery and payment processing purposes.'
    },
    {
      title: 'Security',
      icon: 'lock',
      content: 'We use secure systems to protect your data from unauthorized access.'
    }
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
        <Text className="text-xl font-black text-blue-900 ml-4 tracking-tight">Privacy Policy</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <LinearGradient
          colors={['#1e3a8a', '#1e40af']}
          className="p-10 mb-8"
          style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
        >
          <Text className="text-3xl font-black text-white text-center mb-4">Privacy Policy</Text>
          <Text className="text-white/80 text-center font-bold text-sm">
            We respect your privacy and are committed to protecting your personal information.
          </Text>
        </LinearGradient>

        <View className="px-6">
          {sections.map((section, index) => (
            <View key={index} className="mb-8 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-4">
                  <Icon name={section.icon} size={20} color="#1e3a8a" />
                </View>
                <Text className="text-lg font-black text-blue-900 tracking-tight">{section.title}</Text>
              </View>
              
              {section.points ? (
                <View className="space-y-3">
                  {section.points.map((point, i) => (
                    <View key={i} className="flex-row items-start px-2">
                       <View className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3" />
                       <Text className="flex-1 text-gray-600 font-bold text-sm leading-5">{point}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-600 font-bold text-sm leading-6 px-2">{section.content}</Text>
              )}
            </View>
          ))}

          <View className="bg-blue-900 p-8 rounded-[32px] items-center mt-4">
            <Icon name="verified-user" size={32} color="white" className="mb-4" />
            <Text className="text-white text-center font-bold text-sm leading-6">
              By using our app, you agree to this privacy policy.
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

export default PrivacyPolicyScreen;
