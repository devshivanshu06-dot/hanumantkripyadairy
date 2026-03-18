import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
      alert("Failed to delete address");
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">My Addresses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Address')} className="p-2 -mr-2 bg-red-50 rounded-xl">
          <Icon name="add" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-4 px-4">
        {loading && <ActivityIndicator color="#FF6B6B" className="mb-4" />}

        {(!user?.addresses || user.addresses.length === 0) ? (
          <View className="flex-1 items-center justify-center mt-32">
            <View className="bg-red-50 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Icon name="location-off" size={40} color="#FF6B6B" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2">No Addresses Found</Text>
            <Text className="text-gray-500 mb-8 px-8 text-center">You haven't added any delivery addresses yet.</Text>
            <TouchableOpacity 
              className="bg-red-400 px-8 py-3.5 rounded-xl flex-row items-center shadow-sm"
              onPress={() => navigation.navigate('Address')}
            >
              <Icon name="add" size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold ml-2 text-base">Add New Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {user.addresses.map((addr) => (
              <View key={addr._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-start">
                  
                  <View className="flex-row flex-1">
                    <View className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center mt-1 mr-4">
                      <Icon name={getIconForLabel(addr.label)} size={20} color="#FF6B6B" />
                    </View>
                    <View className="flex-1 pr-4">
                      <View className="flex-row items-center gap-2 mb-1.5">
                        <Text className="text-base font-bold text-gray-900">{addr.label}</Text>
                        {addr.isDefault && (
                          <View className="bg-green-100 px-2.5 py-0.5 rounded-full">
                            <Text className="text-[10px] font-bold text-green-700">DEFAULT</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-600 text-sm leading-5">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-0.5 mb-1">
                        {addr.city}, {addr.pincode}
                      </Text>
                      {addr.coordinates?.latitude && addr.coordinates?.longitude ? (
                        <View className="flex-row items-center">
                          <Icon name="check-circle" size={14} color="#10b981" />
                          <Text className="text-xs text-green-500 font-bold ml-1">
                            Location Pinned
                          </Text>
                        </View>
                      ) : null}
                      {addr.landmark ? (
                        <Text className="text-gray-400 text-xs mt-1">Landmark: {addr.landmark}</Text>
                      ) : null}
                    </View>
                  </View>
                  
                  {/* Action Buttons */}
                  <View className="flex-col gap-2">
                    <TouchableOpacity 
                      className="p-2"
                      onPress={() => navigation.navigate('Address', { address: addr })}
                    >
                      <Icon name="edit" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="p-2"
                      onPress={() => handleDelete(addr._id)}
                    >
                      <Icon name="delete" size={20} color="#ef4444" />
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
