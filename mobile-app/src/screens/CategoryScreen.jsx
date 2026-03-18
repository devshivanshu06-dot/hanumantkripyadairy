import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { productAPI } from '../utils/api';

const CategoryScreen = ({ navigation, route }) => {
  const { category } = route.params || { category: 'All' };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getProductsByCategory(category);
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch category products', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeaderIcon = () => {
    switch (category) {
      case 'Milk': return 'local-drink';
      case 'Curd': return 'soup-kitchen';
      case 'Paneer': return 'breakfast-dining';
      case 'Ghee': return 'opacity';
      default: return 'shopping-basket';
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-3xl mb-4 p-4 shadow-sm border border-gray-100 flex-row items-center"
      onPress={() => navigation.navigate('Products', { product: item })}
      activeOpacity={0.9}
    >
      <View className="h-24 w-24 bg-gray-50 rounded-2xl justify-center items-center mr-4 relative">
        <Image 
          source={{ uri: item.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
          className="w-16 h-16 resize-contain" 
        />
        <View className="absolute top-1 right-1 bg-gray-900 px-1.5 py-0.5 rounded">
          <Text className="text-white text-[8px] font-black uppercase">Sub</Text>
        </View>
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-extrabold text-gray-900 mb-1" numberOfLines={1}>{item.name}</Text>
        <Text className="text-lg font-black text-red-400 mb-2">
          ₹{item.price} <Text className="text-xs font-semibold text-gray-400">/ {item.unit}</Text>
        </Text>
        
        <TouchableOpacity 
          className="bg-red-50 border border-red-100 py-2 rounded-xl items-center flex-row justify-center active:bg-red-100"
          onPress={() => navigation.navigate('Products', { product: item })}
        >
          <Icon name="event-repeat" size={16} color="#ef4444" className="mr-1" />
          <Text className="text-red-500 text-xs font-black uppercase tracking-wider ml-1">
            Subscribe
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
          <Icon name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center justify-center mr-6">
            <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-2 border border-orange-100">
                <Icon name={getHeaderIcon()} size={16} color="#f97316" />
            </View>
            <Text className="text-xl font-extrabold text-gray-900 tracking-tight">{category}</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Icon name="inventory-2" size={64} color="#d1d5db" className="mb-4" />
          <Text className="text-xl font-bold text-gray-800 mb-2">No Products Found</Text>
          <Text className="text-gray-500 text-center">We couldn't find any products in the {category} category right now.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default CategoryScreen;
