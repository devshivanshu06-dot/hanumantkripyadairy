import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../utils/api';
import { GOOGLE_MAPS_API_KEY } from '@env';
import logger from '../utils/logger';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && !MapView) {
  console.warn('MapView native module is NOT available on this device');
}
if (!Geolocation) {
  console.warn('Geolocation native module is NOT available on this device');
}

const AddressScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const existingAddress = route.params?.address;
  
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isOpeningMap, setIsOpeningMap] = useState(false);
  const geocodeTimeout = useRef(null);
  
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
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      return (
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      );
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
      const apiKey = GOOGLE_MAPS_API_KEY || "AIzaSyCLzTq1dVii7DrvKGQ8GLU55V73M_Sv7_A";
      logger.info('AddressScreen: fetchAddressFromCoordinates Start', { lat, lng });
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();
      logger.info('AddressScreen: Geocode Response', { status: data?.status });
        
        if (data.status === 'REQUEST_DENIED') {
          logger.error('AddressScreen: Geocode API KEY DENIED. Check if Geocoding API is enabled in Google Console.');
        }

        if (data && data.status === 'OK' && data.results?.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        const getComponent = (type) => 
          addressComponents.find(c => c.types.includes(type))?.long_name || '';

        const neighborhood = getComponent('sublocality_level_1') || getComponent('sublocality');
        const city = getComponent('locality') || getComponent('administrative_area_level_2');
        const state = getComponent('administrative_area_level_1');
        const pincode = getComponent('postal_code');
        
        // Use a cleaner version of the formatted address for Line 1
        const parts = result.formatted_address.split(',');
        // Usually the first 1-2 parts are the specific location
        const line1 = parts.length > 3 
          ? parts.slice(0, parts.length - 3).join(', ').trim() 
          : parts[0];

        setFormData(prev => ({
          ...prev,
          addressLine1: line1,
          landmark: neighborhood || prev.landmark,
          city: city,
          state: state,
          pincode: pincode,
        }));
        setSearchQuery(result.formatted_address);
      }
    } catch (error) {
      logger.error('AddressScreen: Reverse Geocoding Error', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&components=country:in`
        );
        const data = await response.json();
        if (data && data.predictions) {
          setSearchResults(data.predictions);
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

  const handleSelectSearchResult = async (prediction) => {
    if (!prediction || !prediction.place_id) return;
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data && data.status === 'OK') {
        const { location } = data.result.geometry;
        const addressComponents = data.result.address_components;
        
        const getComponent = (type) => 
          addressComponents.find(c => c.types.includes(type))?.long_name || '';

        const lat = location.lat;
        const lng = location.lng;
        
        setCoordinates({ latitude: lat, longitude: lng });
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        });
        
        const neighborhood = getComponent('sublocality_level_1') || getComponent('sublocality');

        setFormData(prev => ({
          ...prev,
          addressLine1: prediction.structured_formatting.main_text,
          landmark: neighborhood || prev.landmark,
          city: getComponent('locality') || getComponent('administrative_area_level_2'),
          state: getComponent('administrative_area_level_1'),
          pincode: getComponent('postal_code') || prev.pincode
        }));
        
        setShowSearchResults(false);
        setSearchQuery(prediction.description);
      }
    } catch (error) {
      console.error('Place details error:', error);
      Alert.alert("Error", "Could not fetch place details");
    }
  };

  useEffect(() => {
    logger.info('AddressScreen: Component Mounted (GPS Enabled)');
    if (!existingAddress) {
      handleGetCurrentLocation(true);
    }
  }, []);

  const handleGetCurrentLocation = async (silent = false) => {
    try {
      if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
        logger.error('AddressScreen: Geolocation library is NULL or invalid');
        if (!silent) Alert.alert("Error", "GPS module is currently unavailable. Please try again or use the search bar.");
        return;
      }

      setFetchingLocation(true);

      if (Platform.OS === 'android') {
        Geolocation.setRNConfiguration({
          skipPermissionRequests: true,
          locationProvider: 'playServices',
        });
      }
      
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setFetchingLocation(false);
        if (!silent) Alert.alert("Permission Error", "Location permission denied. Please enable it in settings.");
        return;
      }

      const getPosition = (options) =>
        new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, options);
        });

      const applyPosition = (position) => {
        logger.info('AddressScreen: GPS Success', { lat: position.coords.latitude, lng: position.coords.longitude });
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        setMapRegion(prev => ({ ...prev, latitude, longitude }));

        setFormData(prev => ({
          ...prev,
          addressLine1: '',
          city: '',
          pincode: ''
        }));

        fetchAddressFromCoordinates(latitude, longitude);
        setFetchingLocation(false);

        if (!silent) {
          Alert.alert('Success', 'Location captured! You can now Confirm & Save.');
        }
      };

      try {
        const position = await getPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        });
        applyPosition(position);
      } catch (primaryError) {
        const shouldFallbackToNetwork =
          Platform.OS === 'android' &&
          (primaryError?.code === 2 || primaryError?.code === 3);

        if (!shouldFallbackToNetwork) {
          logger.warn('AddressScreen: GPS Error Callback', primaryError);
          setFetchingLocation(false);
          if (!silent) {
            Alert.alert('Location Error', primaryError?.message || 'Failed to get location.');
          }
          return;
        }

        try {
          if (Platform.OS === 'android') {
            Geolocation.setRNConfiguration({
              skipPermissionRequests: true,
              locationProvider: 'android',
            });
          }

          const fallbackPosition = await getPosition({
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 30000,
          });
          applyPosition(fallbackPosition);
        } catch (fallbackError) {
          logger.warn('AddressScreen: Android fallback GPS Error', fallbackError);
          setFetchingLocation(false);
          if (!silent) {
            Alert.alert('Location Error', fallbackError?.message || 'Failed to get location.');
          }
        }
      }
    } catch (err) {
      logger.error('AddressScreen: handleGetCurrentLocation Crash', err);
      setFetchingLocation(false);
      if (!silent) {
        Alert.alert("Error", "Something went wrong while detecting location.");
      }
    }
  };

  const handleOpenMap = async () => {
    setIsOpeningMap(true);
    try {
      if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
        logger.error('AddressScreen: handleOpenMap Geolocation library is NULL');
        setShowMapModal(true);
        setIsOpeningMap(false);
        return;
      }
      
      logger.info('AddressScreen: handleOpenMap Start');
      // Use existing coords if we have them
      if (coordinates.latitude) {
        setMapRegion({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        });
        setShowMapModal(true);
        setIsOpeningMap(false);
        return;
      }

      // Quick GPS capture for map
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          logger.info('AddressScreen: Map GPS Success', { latitude, longitude });
          
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          };
          
          setCoordinates({ latitude, longitude });
          setMapRegion(newRegion);
          setShowMapModal(true);
          setIsOpeningMap(false);
          
          // Reverse geocode this new spot too
          fetchAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          logger.warn('AddressScreen: Map GPS failed, opening at last known or default', error);
          setShowMapModal(true);
          setIsOpeningMap(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } catch (err) {
      setShowMapModal(true);
      setIsOpeningMap(false);
    }
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
      Alert.alert("Required Fields", "Please fill required fields (Address line 1, City, Pincode)");
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
      Alert.alert("Error", error.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const labels = ['Home', 'Work', 'Other'];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50 bg-white z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-2xl">
          <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 ml-4 tracking-tight">
          {existingAddress ? 'Edit Address' : 'Add New Address'}
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 bg-[#F8FAFC]" bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            {/* Search Section */}
            <View className="p-6 bg-white mb-2 z-50">
              <Text className="text-[10px] font-black text-gray-400 mb-2 tracking-widest uppercase">Search your location</Text>
              <View className="relative">
                <View className="flex-row items-center bg-gray-50 px-4 rounded-2xl border border-gray-100">
                  <Icon name="search" size={20} color="#94a3b8" />
                  <TextInput
                    placeholder="Search area, street or city..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    className="flex-1 h-14 ml-2 text-base font-bold text-blue-950"
                    placeholderTextColor="#94a3b8"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}>
                      <Icon name="close" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>

                {showSearchResults && searchResults.length > 0 && (
                  <View className="absolute top-16 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50">
                    {searchResults.map((item, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => handleSelectSearchResult(item)}
                        className={`p-4 flex-row items-center ${index !== searchResults.length - 1 ? 'border-b border-gray-50' : ''}`}
                      >
                        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                          <Icon name="location-on" size={16} color="#1e3a8a" />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="text-sm font-black text-blue-950" numberOfLines={1}>
                            {item.structured_formatting?.main_text || item.description}
                          </Text>
                          <Text className="text-[10px] font-bold text-gray-400" numberOfLines={1}>
                            {item.structured_formatting?.secondary_text || ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Location Section */}
            <View className="p-6 bg-white mb-2">
              <View className="flex-row gap-3">
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
                      <Text className="ml-2 font-black text-blue-900 text-xs tracking-tight">
                        {hasCoordinates ? 'Update PIN' : 'Auto Detect'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleOpenMap}
                  disabled={isOpeningMap}
                  className="flex-1 flex-row items-center justify-center py-4 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  {isOpeningMap ? (
                    <ActivityIndicator color="#475569" size="small" />
                  ) : (
                    <>
                      <Icon name="map" size={20} color="#475569" />
                      <Text className="ml-2 font-black text-slate-600 text-xs tracking-tight">
                        Select on Map
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {hasCoordinates && !fetchingLocation && (
                <View className="mt-4 flex-row items-center justify-center bg-green-50 py-3 rounded-2xl border border-green-100">
                  <Icon name="check-circle" size={16} color="#10b981" />
                  <Text className="ml-2 text-[10px] text-green-700 font-black uppercase">
                    Location Secured
                  </Text>
                </View>
              )}
            </View>

            {/* Form Section */}
            <View className="p-6 bg-white min-h-screen">
                
                <Text className="text-[10px] font-black text-gray-400 mb-4 tracking-widest uppercase">Save address as</Text>
                <View className="flex-row gap-3 mb-8">
                    {labels.map(lbl => (
                        <TouchableOpacity
                            key={lbl}
                            onPress={() => setFormData({...formData, label: lbl})}
                            className={`px-6 py-2.5 rounded-2xl border-2 ${formData.label === lbl ? 'bg-blue-900 border-blue-900' : 'bg-white border-gray-100'}`}
                        >
                            <Text className={`font-black text-sm ${formData.label === lbl ? 'text-white' : 'text-gray-400'}`}>{lbl}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="space-y-5">
                    <View>
                        <Text className="text-[10px] font-black text-blue-900 mb-2 ml-1 uppercase tracking-widest">Complete Address *</Text>
                        <TextInput 
                            placeholder="House No, Building, Street"
                            value={formData.addressLine1}
                            onChangeText={t => setFormData({...formData, addressLine1: t})}
                            className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 text-base font-bold text-blue-950"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    
                    <View>
                        <Text className="text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-widest">Nearby Landmark</Text>
                        <TextInput 
                            placeholder="e.g. Near Apollo Hospital"
                            value={formData.landmark}
                            onChangeText={t => setFormData({...formData, landmark: t})}
                            className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 text-base font-bold text-blue-950"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View>
                        <Text className="text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-widest">Floor / Tower</Text>
                        <TextInput 
                            placeholder="Optional"
                            value={formData.addressLine2}
                            onChangeText={t => setFormData({...formData, addressLine2: t})}
                            className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 text-base font-bold text-blue-950"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-blue-900 mb-2 ml-1 uppercase tracking-widest">City *</Text>
                            <TextInput 
                                placeholder="City"
                                value={formData.city}
                                onChangeText={t => setFormData({...formData, city: t})}
                                className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 text-base font-bold text-blue-950"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-blue-900 mb-2 ml-1 uppercase tracking-widest">Pincode *</Text>
                            <TextInput 
                                placeholder="Pincode"
                                value={formData.pincode}
                                keyboardType="number-pad"
                                maxLength={6}
                                onChangeText={t => setFormData({...formData, pincode: t})}
                                className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 text-base font-bold text-blue-950"
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity 
                    className="bg-blue-900 py-5 rounded-[24px] items-center flex-row justify-center mt-12 mb-10 shadow-xl shadow-blue-200"
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-lg font-black uppercase tracking-widest">Confirm & Save</Text>
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
            {showMapModal && MapView ? (
              <MapView
                style={{ flex: 1 }}
                provider={PROVIDER_GOOGLE}
                region={{
                  ...mapRegion,
                  latitudeDelta: mapRegion.latitudeDelta || 0.01,
                  longitudeDelta: mapRegion.longitudeDelta || 0.01,
                }}
                onRegionChangeComplete={(region) => {
                  setMapRegion(region);
                  
                  // Debounce the geocode call so we don't spam Google while moving
                  if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
                  geocodeTimeout.current = setTimeout(() => {
                    fetchAddressFromCoordinates(region.latitude, region.longitude);
                  }, 800);
                }}
              />
            ) : (
              <View className="flex-1 items-center justify-center bg-gray-50 p-10">
                <Icon name="error-outline" size={48} color="#94a3b8" />
                <Text className="text-gray-400 font-bold mt-4 text-center">Map Module Unavailable</Text>
              </View>
            )}

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
                           {(mapRegion.latitude || 0).toFixed(4)}, {(mapRegion.longitude || 0).toFixed(4)}
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
