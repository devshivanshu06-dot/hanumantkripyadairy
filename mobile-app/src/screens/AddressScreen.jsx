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
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../utils/api';
import { Modal, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const AddressScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const existingAddress = route.params?.address;
  
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  // Fake map region for placeholder
  const [mapRegion, setMapRegion] = useState({
    latitude: existingAddress?.coordinates?.latitude || 26.9124, // Jaipur default
    longitude: existingAddress?.coordinates?.longitude || 75.7873,
  });
  
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
    state: existingAddress?.state || '',
    pincode: existingAddress?.pincode || '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Pincode to City/State effect
  useEffect(() => {
    if (formData.pincode.length === 6) {
      fetchCityStateFromPincode(formData.pincode);
    }
  }, [formData.pincode]);

  const fetchCityStateFromPincode = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District || postOffice.Block,
          state: postOffice.State
        }));
      }
    } catch (error) {
      console.error('Error fetching pincode details:', error);
    }
  };

  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          'User-Agent': 'HanumantDairyApp/1.0',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const data = await response.json();
      if (data && data.address) {
        setFormData(prev => ({
          ...prev,
          addressLine1: data.display_name.split(',').slice(0, 2).join(', ').trim(),
          city: data.address.city || data.address.town || data.address.village || data.address.county || prev.city,
          state: data.address.state || prev.state,
          pincode: data.address.postcode || prev.pincode,
        }));
      }
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        if (data && data.features) {
          setSearchResults(data.features);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSelectSearchResult = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const { name, city, state, postcode } = feature.properties;
    
    setCoordinates({ latitude: lat, longitude: lng });
    setMapRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    });
    
    setFormData(prev => ({
      ...prev,
      addressLine1: name || prev.addressLine1,
      city: city || prev.city,
      state: state || prev.state,
      pincode: postcode || prev.pincode
    }));
    
    setShowSearchResults(false);
    setSearchQuery(name || '');
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
        setMapRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
        setFetchingLocation(false);
        fetchAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
        alert("Location captured & address updated!");
      },
      (error) => {
        setFetchingLocation(false);
        alert(error.message || "Failed to get location");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMapConfirm = () => {
    setCoordinates({
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude
    });
    fetchAddressFromCoordinates(mapRegion.latitude, mapRegion.longitude);
    setShowMapModal(false);
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
        <ScrollView className="flex-1 bg-gray-50" bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            {/* Search Section */}
            <View className="p-4 bg-white mb-2 z-50">
              <Text className="text-xs font-bold text-gray-400 mb-2 tracking-wider uppercase">Search your location</Text>
              <View className="relative">
                <View className="flex-row items-center bg-gray-50 px-4 rounded-xl border border-gray-100">
                  <Icon name="search" size={20} color="#9ca3af" />
                  <TextInput
                    placeholder="Search area, street or city..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    className="flex-1 h-12 ml-2 text-base font-medium text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}>
                      <Icon name="close" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>

                {showSearchResults && searchResults.length > 0 && (
                  <View className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                    {searchResults.map((item, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => handleSelectSearchResult(item)}
                        className={`p-4 flex-row items-center ${index !== searchResults.length - 1 ? 'border-b border-gray-50' : ''}`}
                      >
                        <Icon name="location-on" size={18} color="#1e3a8a" />
                        <View className="ml-3 flex-1">
                          <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                            {item.properties.name}
                          </Text>
                          <Text className="text-xs text-gray-500" numberOfLines={1}>
                            {[item.properties.city, item.properties.state, item.properties.country].filter(Boolean).join(', ')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Location Section */}
            <View className="p-4 bg-white mb-2">
              <View className="flex-row gap-2 mt-3 mb-2">
                <TouchableOpacity 
                  onPress={handleGetCurrentLocation}
                  disabled={fetchingLocation}
                  className="flex-1 flex-row items-center justify-center py-4 bg-blue-50 rounded-2xl border border-blue-100"
                >
                  {fetchingLocation ? (
                    <ActivityIndicator color="#1e3a8a" />
                  ) : (
                    <>
                      <Icon name="my-location" size={20} color="#1e3a8a" />
                      <Text className="ml-2 font-bold text-blue-900 text-xs text-center">
                        {hasCoordinates ? 'Update Location' : 'Current Location'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setShowMapModal(true)}
                  className="flex-1 flex-row items-center justify-center py-4 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  <Icon name="map" size={20} color="#4b5563" />
                  <Text className="ml-2 font-bold text-gray-700 text-xs text-center">
                    Select via Map Drop
                  </Text>
                </TouchableOpacity>
              </View>

              {hasCoordinates && !fetchingLocation && (
                <View className="mt-2 flex-row items-center justify-center bg-green-50 py-2 rounded-xl">
                  <Icon name="check-circle" size={16} color="#10b981" />
                  <Text className="ml-1 text-xs text-green-600 font-medium">
                    Lat: {coordinates.latitude.toFixed(4)}, Lng: {coordinates.longitude.toFixed(4)}
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
                            className={`px-5 py-2 rounded-xl border ${formData.label === lbl ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-bold text-sm ${formData.label === lbl ? 'text-blue-900' : 'text-gray-600'}`}>{lbl}</Text>
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
                                placeholder="State"
                                value={formData.state}
                                onChangeText={t => setFormData({...formData, state: t})}
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
                    className="bg-blue-900 py-4 rounded-2xl items-center flex-row justify-center mt-10 mb-8 shadow-sm"
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

      {/* Map Modal (Zomato-style flow) */}
      <Modal visible={showMapModal} animationType="slide" transparent={false}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Icon name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900 ml-4">
              Set Delivery Location
            </Text>
          </View>
          <View className="flex-1 bg-gray-100 relative">
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                ...mapRegion,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onRegionChangeComplete={(region) => {
                setMapRegion(region);
                // Auto-fetch address when map drag ends (Zomato-style)
                fetchAddressFromCoordinates(region.latitude, region.longitude);
              }}
            >
              {/* 100% Free OpenStreetMap Surface */}
              <UrlTile
                urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
            </MapView>

            {/* Fixed Central Pin drops at map center */}
            <View pointerEvents="none" style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -24, marginTop: -48, zIndex: 10 }}>
              <Icon name="location-pin" size={48} color="#ef4444" />
            </View>
            
            <View className="absolute bottom-6 left-6 right-6">
               <View className="bg-white p-5 rounded-3xl shadow-xl mb-4 border border-gray-100">
                   <View className="flex-row items-center mb-2">
                       <Icon name="location-on" size={18} color="#ef4444" />
                       <Text className="font-black text-gray-900 ml-2 text-sm uppercase">Select Location</Text>
                   </View>
                   <Text className="text-gray-800 text-sm font-bold leading-tight mb-2" numberOfLines={2}>
                       {formData.addressLine1 || 'Fetching address...'}
                   </Text>
                   <View className="flex-row justify-between items-center border-t border-gray-50 pt-2">
                       <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                           {formData.city}, {formData.pincode}
                       </Text>
                       <Text className="text-gray-300 text-[10px]">
                           {mapRegion.latitude.toFixed(4)}, {mapRegion.longitude.toFixed(4)}
                       </Text>
                   </View>
               </View>
               <TouchableOpacity 
                 className="bg-blue-900 py-4 rounded-2xl items-center shadow-lg w-full flex-row justify-center"
                 onPress={handleMapConfirm}
               >
                 <Icon name="check-circle" size={20} color="white" className="mr-2" />
                 <Text className="text-white font-black text-lg ml-2">Confirm Location</Text>
               </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

export default AddressScreen;
