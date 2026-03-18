import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

const MyOrdersScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-white justify-center items-center">
            <Text className="text-xl font-bold">My Orders</Text>
            <Text className="text-gray-500 mt-2">Coming Soon</Text>
        </SafeAreaView>
    );
};

export default MyOrdersScreen;
