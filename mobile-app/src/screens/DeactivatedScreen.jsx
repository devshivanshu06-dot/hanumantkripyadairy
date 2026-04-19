import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

const DeactivatedScreen = () => {
  const { logout, user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="flex-1 px-8 items-center justify-center">
        {/* Animated Background Pulse (Subtle) */}
        <View className="w-32 h-32 bg-red-50 rounded-full items-center justify-center mb-8">
          <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center">
            <Icon name="block" size={48} color="#ef4444" />
          </View>
        </View>

        <Text className="text-2xl font-black text-gray-900 mb-4 text-center">
          Account Restricted
        </Text>

        <Text className="text-base font-bold text-gray-500 text-center leading-6 mb-12">
          Hello {user?.name || 'Customer'},\nYour account has been deactivated by the administrator. Please contact our support team to resolve this issue.
        </Text>

        <View className="w-full space-y-4">
          <TouchableOpacity 
            className="bg-blue-900 py-4 rounded-2xl items-center shadow-lg flex-row justify-center"
            activeOpacity={0.8}
            onPress={() => {/* In a real app, link to support or phone */}}
          >
            <Icon name="support-agent" size={20} color="white" />
            <Text className="text-white font-black text-lg ml-2">Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="py-4 rounded-2xl items-center flex-row justify-center"
            onPress={logout}
          >
            <Icon name="logout" size={20} color="#94a3b8" />
            <Text className="text-gray-400 font-black text-base ml-2">Logout</Text>
          </TouchableOpacity>
        </View>

        <Text className="absolute bottom-10 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Hanumant Kripa Dairy
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default DeactivatedScreen;
