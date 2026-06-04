import React from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Loader = ({ message = "Loading..." }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0.4));

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} className="items-center justify-center">
      <LinearGradient
        colors={['rgba(30, 58, 138, 0.4)', 'rgba(15, 23, 42, 0.8)']}
        className="absolute inset-0"
      />
      
      <Animated.View 
        style={{ opacity: fadeAnim }}
        className="items-center"
      >
        <View className="bg-white/10 p-8 rounded-[40px] border border-white/20 shadow-2xl">
           <Image 
             source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }}
             className="w-24 h-24 tint-white"
             resizeMode="contain"
             style={{ tintColor: 'white' }}
           />
        </View>
        
        <View className="mt-8 items-center">
          <Text className="text-white text-3xl font-black tracking-tighter shadow-sm">Hanumant Diary</Text>
          <Text className="text-blue-100/60 text-[10px] font-bold uppercase tracking-[4px] mt-2">Purity in every drop</Text>
        </View>

        <View className="mt-12">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Animated.View>

      <View className="absolute bottom-10">
        <Text className="text-blue-100/30 text-[9px] font-black uppercase tracking-widest">v1.0.0 Premium</Text>
      </View>
    </View>
  );
};

export default Loader;
