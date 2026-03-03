import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../utils/api';

const AddressScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const existingAddress = route.params?.address;
  
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  
  const [coordinates, setCoordinates] = useState({
    latitude: existingAddress?.coordinates?.latitude || null,
    longitude: existingAddress?.coordinates?.longitude || null,
  });

  const [formData, setFormData] = useState({
    label: existingAddress?.label || 'Home',
    addressLine1: existingAddress?.addressLine1 || '',
    addressLine2: existingAddress?.addressLine2 || '',
    landmark: existingAddress?.landmark || '',
    city: existingAddress?.city || '',
    pincode: existingAddress?.pincode || '',
  });

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      return true;
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Hanumant Dairy needs access to your location to set delivery addresses.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleGetCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      alert("Location permission denied");
      return;
    }

    setFetchingLocation(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setFetchingLocation(false);
        alert("Location captured successfully!");
      },
      (error) => {
        setFetchingLocation(false);
        alert(error.message || "Failed to get location");
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
    );
  };

  const hasCoordinates = coordinates.latitude !== null && coordinates.longitude !== null;

  const handleSave = async () => {
    if (!formData.addressLine1 || !formData.city || !formData.pincode) {
      alert("Please fill required fields (Address line 1, City, Pincode)");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        coordinates: hasCoordinates ? coordinates : undefined,
        isDefault: true
      };

      if (existingAddress?._id) {
        await addressAPI.updateAddress(existingAddress._id, payload);
      } else {
        await addressAPI.addAddress(payload);
      }
      
      navigation.goBack();
    } catch (error) {
      alert(error.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const labels = ['Home', 'Work', 'Other'];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 bg-white z-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 ml-4">
          {existingAddress ? 'Edit Address' : 'Add New Address'}
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 bg-gray-50" bounces={false} showsVerticalScrollIndicator={false}>
            
            {/* Location Section */}
            <View className="p-4 bg-white mb-2">
              <TouchableOpacity 
                onPress={handleGetCurrentLocation}
                disabled={fetchingLocation}
                className="flex-row items-center justify-center py-4 bg-red-50 rounded-2xl border border-red-100"
              >
                {fetchingLocation ? (
                  <ActivityIndicator color="#FF6B6B" />
                ) : (
                  <>
                    <Icon name="my-location" size={20} color="#FF6B6B" />
                    <Text className="ml-2 font-bold text-red-500">
                      {hasCoordinates 
                        ? 'Update Current Location' 
                        : 'Use Current Location'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {hasCoordinates && !fetchingLocation && (
                <View className="mt-3 flex-row items-center justify-center">
                  <Icon name="check-circle" size={16} color="#10b981" />
                  <Text className="ml-1 text-xs text-green-500 font-medium">
                    Location coordinates captured ({coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)})
                  </Text>
                </View>
              )}
            </View>

            {/* Form Section */}
            <View className="p-4 bg-white min-h-screen">
                
                {/* Labels */}
                <Text className="text-xs font-bold text-gray-400 mb-3 tracking-wider">SAVE THIS ADDRESS AS</Text>
                <View className="flex-row gap-3 mb-6">
                    {labels.map(lbl => (
                        <TouchableOpacity
                            key={lbl}
                            onPress={() => setFormData({...formData, label: lbl})}
                            className={`px-5 py-2 rounded-xl border ${formData.label === lbl ? 'bg-red-50 border-red-400' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-bold text-sm ${formData.label === lbl ? 'text-red-500' : 'text-gray-600'}`}>{lbl}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Inputs */}
                <View className="space-y-4">
                    <View>
                        <TextInput 
                            placeholder="Complete Address (House No, Building, Street) *"
                            value={formData.addressLine1}
                            onChangeText={t => setFormData({...formData, addressLine1: t})}
                            className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-100/50 text-base font-medium text-gray-900"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                    
                    <View>
                        <TextInput 
                            placeholder="Floor / Tower (Optional)"
                            value={formData.addressLine2}
                            onChangeText={t => setFormData({...formData, addressLine2: t})}
                            className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-100/50 text-base font-medium text-gray-900"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View>
                        <TextInput 
                            placeholder="Nearby Landmark (Optional)"
                            value={formData.landmark}
                            onChangeText={t => setFormData({...formData, landmark: t})}
                            className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-100/50 text-base font-medium text-gray-900"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View className="flex-row gap-3">
                        <View className="flex-1 border-r border-gray-100 pr-3">
                            <TextInput 
                                placeholder="City *"
                                value={formData.city}
                                onChangeText={t => setFormData({...formData, city: t})}
                                className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-100/50 text-base font-medium text-gray-900"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <View className="flex-1">
                            <TextInput 
                                placeholder="Pincode *"
                                value={formData.pincode}
                                keyboardType="number-pad"
                                maxLength={6}
                                onChangeText={t => setFormData({...formData, pincode: t})}
                                className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-100/50 text-base font-medium text-gray-900"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                    className="bg-red-500 py-4 rounded-2xl items-center flex-row justify-center mt-10 mb-8 shadow-sm"
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-[17px] font-bold">Save Address</Text>
                    )}
                </TouchableOpacity>

            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddressScreen;
