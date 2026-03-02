import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { productAPI, subscriptionAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { cartCount, addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsRes, subsRes] = await Promise.all([
        productAPI.getProducts(),
        subscriptionAPI.getMySubscriptions()
      ]);
      setProducts(productsRes.data);
      setSubscriptions(subsRes.data);
    } catch (error) {
      console.error('Failed to fetch home data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('Products', { product: item })}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={{ uri: item.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
          style={styles.productImage} 
        />
        {item.isSubscriptionAvailable && (
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeText}>Subscription</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price} <Text style={styles.productUnit}>/ {item.unit}</Text></Text>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            if (item.isSubscriptionAvailable) {
              navigation.navigate('Products', { product: item });
            } else {
              addToCart(item._id, 1);
            }
          }}
        >
          <Text style={styles.addButtonText}>
            {item.isSubscriptionAvailable ? 'View Plan' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {user?.name?.split(' ')[0]}! 👋</Text>
          <Text style={styles.location}>
            <Icon name="location-on" size={14} color="#FF6B6B" /> {user?.address || 'Set your address'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartBtn}
        >
          <Icon name="shopping-cart" size={24} color="#1a1a1a" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Active Subscriptions */}
        {subscriptions.filter(s => s.status === 'active').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Daily Deliveries</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subsList}>
              {subscriptions.filter(s => s.status === 'active').map((sub) => (
                <TouchableOpacity 
                  key={sub._id}
                  style={styles.subCard}
                  onPress={() => navigation.navigate('Schedule')}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    style={styles.subGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.subRow}>
                      <Icon name="local-drink" size={24} color="white" />
                      <Text style={styles.subName}>{sub.product.name}</Text>
                    </View>
                    <Text style={styles.subQuantity}>{sub.quantity} {sub.product.unit} • {sub.timeSlot}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Promo Banner */}
        <TouchableOpacity style={styles.banner} activeOpacity={0.9}>
          <LinearGradient
            colors={['#1a1a1a', '#4a4a4a']}
            style={styles.bannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View>
              <Text style={styles.bannerTitle}>Fresh Milk Daily</Text>
              <Text style={styles.bannerSubtitle}>Pure, Organic & Untouched</Text>
              <View style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Subscribe Now</Text>
              </View>
            </View>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }}
              style={styles.bannerImg}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories (Hardcoded for now as they are static) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.categoriesGrid}>
            {['Milk', 'Curd', 'Paneer', 'Ghee'].map((cat) => (
              <TouchableOpacity key={cat} style={styles.catItem}>
                <View style={styles.catIconWrap}>
                  <Icon name={cat === 'Milk' ? 'local-drink' : 'shopping-basket'} size={24} color="#FF6B6B" />
                </View>
                <Text style={styles.catName}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 24,
  },
  seeAllText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 14,
  },
  subsList: {
    paddingHorizontal: 24,
  },
  subCard: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    width: 220,
  },
  subGradient: {
    padding: 16,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  subQuantity: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  banner: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  bannerBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  bannerImg: {
    width: 80,
    height: 80,
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  catItem: {
    alignItems: 'center',
  },
  catIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  catName: {
    fontSize: 13,
    color: '#4a4a4a',
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 24,
  },
  productCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  subBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '700',
  },
  productInfo: {
    paddingBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  productUnit: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  addButton: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default HomeScreen;