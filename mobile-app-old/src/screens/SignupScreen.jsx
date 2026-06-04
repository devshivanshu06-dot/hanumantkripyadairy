import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Geolocation from 'react-native-geolocation-service';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { PermissionsAndroid } from 'react-native';

const SignupScreen = ({ navigation, route }) => {
  const { token, user: initialUser } = route.params;
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (name.trim().length < 3) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      let locationData = null;
      
      // Attempt to get quick location for prefilling
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const position = await new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 });
          }).catch(() => null);
          
          if (position) {
            locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
          }
        }
      }

      const response = await authAPI.updateProfile(token, { 
        name: name.trim(),
        initialLocation: locationData
      });

      if (response.data.success) {
        await login(token, response.data.user);
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>All Set!</Text>
            <Text style={styles.subtitle}>Welcome to Hanumant Kripaya Dairy. Tell us your name to get started.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.button, (loading || name.length < 3) && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading || name.length < 3}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Finish Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    lineHeight: 24,
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default SignupScreen;
