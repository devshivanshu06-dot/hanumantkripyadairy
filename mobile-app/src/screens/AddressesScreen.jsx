import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../utils/api';

const AddressesScreen = ({ navigation }) => {
  const { user, reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reload user when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      reloadUser();
    });
    return unsubscribe;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await addressAPI.deleteAddress(id);
      await reloadUser();
    } catch (error) {
      Alert.alert("Delete Error", "Failed to delete address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getIconForLabel = (label) => {
    switch(label) {
      case 'Home': return 'home';
      case 'Work': return 'work';
      default: return 'location-on';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-white border-b border-gray-50 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 bg-gray-50 rounded-2xl">
          <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 tracking-tight">My Addresses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Address')} className="p-2 -mr-2 bg-blue-50 rounded-2xl border border-blue-100">
          <Icon name="add" size={24} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-6 px-6" showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color="#1e3a8a" className="mb-4" />}

        {(!user?.addresses || user.addresses.length === 0) ? (
          <View className="flex-1 items-center justify-center mt-32">
            <View className="bg-blue-50 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Icon name="location-off" size={40} color="#1e3a8a" />
            </View>
            <Text className="text-2xl font-black text-blue-950 mb-2">No Addresses Found</Text>
            <Text className="text-gray-400 font-bold mb-8 px-8 text-center">You haven't added any delivery addresses yet.</Text>
            <TouchableOpacity 
              className="bg-blue-900 px-8 py-4 rounded-2xl flex-row items-center shadow-lg shadow-blue-200"
              onPress={() => navigation.navigate('Address')}
            >
              <Icon name="add" size={20} color="white" />
              <Text className="text-white font-black ml-2 text-base uppercase tracking-widest">Add New Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {user.addresses.map((addr) => (
              <View key={addr._id} className="bg-white rounded-[32px] p-6 mb-4 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-start">
                  
                  <View className="flex-row flex-1">
                    <View className="bg-blue-50 w-12 h-12 rounded-2xl items-center justify-center mr-4 border border-blue-100">
                      <Icon name={getIconForLabel(addr.label)} size={24} color="#1e3a8a" />
                    </View>
                    <View className="flex-1 pr-4">
                      <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-lg font-black text-blue-950">{addr.label}</Text>
                        {addr.isDefault && (
                          <View className="bg-green-100 px-3 py-1 rounded-lg">
                            <Text className="text-[10px] font-black text-green-700 uppercase">Default</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-500 font-bold text-sm leading-5">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      </Text>
                      <Text className="text-gray-400 font-bold text-xs mt-1">
                        {addr.city}, {addr.pincode}
                      </Text>
                      {addr.coordinates?.latitude && addr.coordinates?.longitude ? (
                        <View className="flex-row items-center mt-3">
                          <Icon name="check-circle" size={14} color="#10b981" />
                          <Text className="text-[10px] text-green-600 font-black ml-1 uppercase">
                            Location Pinned
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  
                  {/* Action Buttons */}
                  <View className="flex-col gap-2">
                    <TouchableOpacity 
                      className="p-3 bg-blue-50 rounded-xl"
                      onPress={() => navigation.navigate('Address', { address: addr })}
                    >
                      <Icon name="edit" size={20} color="#1e3a8a" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="p-3 bg-red-50 rounded-xl"
                      onPress={() => handleDelete(addr._id)}
                    >
                      <Icon name="delete-outline" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddressesScreen;
