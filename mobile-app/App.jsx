import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import Global Components
import Loader from './src/components/Loader';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddressesScreen from './src/screens/AddressesScreen';
import AddressScreen from './src/screens/AddressScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import WalletScreen from './src/screens/WalletScreen';
import SubscriptionConfirmScreen from './src/screens/SubscriptionConfirmScreen';
import SignupScreen from './src/screens/SignupScreen';
import SupportScreen from './src/screens/SupportScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import AboutScreen from './src/screens/AboutScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import DeactivatedScreen from './src/screens/DeactivatedScreen';
import logger from './src/utils/logger';

// Import Contexts
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useAuth();
  const walletBalance = user?.walletBalance || 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Delivery') iconName = 'event-repeat';
          else if (route.name === 'Wallet') iconName = 'account-balance-wallet';
          else if (route.name === 'Profile') iconName = 'person';
          
          return (
            <Icon 
              name={iconName} 
              size={size} 
              color={focused ? '#1e3a8a' : '#9ca3af'} 
              />
          );
        },
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          backgroundColor: 'white',
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Delivery" component={MyOrdersScreen} />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          tabBarLabel: `Wallet`
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader message="Setting up your experience..." />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : user.is_active === false ? (
        <Stack.Screen name="Deactivated" component={DeactivatedScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Products" component={ProductScreen} />
          <Stack.Screen name="Addresses" component={AddressesScreen} />
          <Stack.Screen name="Address" component={AddressScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="SubscriptionConfirm" component={SubscriptionConfirmScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
      {/* Shared Screens */}
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  React.useEffect(() => {
    // Set up global error handler for logging crashes
    const defaultHandler = (global.ErrorUtils?.getGlobalHandler && global.ErrorUtils.getGlobalHandler()) || console.error;
    
    global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
      logger.error(`GLOBAL_CRASH (${isFatal ? 'FATAL' : 'NON-FATAL'})`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Still call default to allow react-native standard crash behavior
      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });

    logger.info('App: Session Started');
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;