import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { cart, loading, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleUpdateQty = async (productId, newQty) => {
    try {
      await updateQuantity(productId, newQty);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    if (!user.address) {
      Alert.alert('Address Required', 'Please set your delivery address in profile', [
        { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
        { text: 'Cancel', style: 'cancel' }
      ]);
      return;
    }

    setCheckingOut(true);
    try {
      await orderAPI.createOrder(user.address);
      Alert.alert('Success', 'Order placed successfully!', [
        { text: 'Track Order', onPress: () => navigation.navigate('Orders') }
      ]);
      await clearCart();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading && !cart) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Icon name="shopping-cart" size={64} color="#FF6B6B" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Looks like you haven't added anything yet</Text>
            <TouchableOpacity 
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.addressSection}>
              <View style={styles.addressHeader}>
                <Icon name="location-on" size={20} color="#FF6B6B" />
                <Text style={styles.addressTitle}>Delivery Address</Text>
              </View>
              <Text style={styles.addressText} numberOfLines={2}>
                {user?.address || 'No address set. Please update in profile.'}
              </Text>
            </View>

            <View style={styles.itemsContainer}>
              {cart.items.map((item) => (
                <View key={item.product._id} style={styles.cartItem}>
                  <Image 
                    source={{ uri: item.product.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
                    style={styles.itemImage} 
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                    <Text style={styles.itemUnit}>₹{item.product.price} / {item.product.unit}</Text>
                    
                    <View style={styles.qtyRow}>
                      <View style={styles.stepper}>
                        <TouchableOpacity 
                          style={styles.stepBtn}
                          onPress={() => handleUpdateQty(item.product._id, item.quantity - 1)}
                        >
                          <Icon name="remove" size={18} color="#FF6B6B" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.stepBtn}
                          onPress={() => handleUpdateQty(item.product._id, item.quantity + 1)}
                        >
                          <Icon name="add" size={18} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.itemTotal}>₹{item.product.price * item.quantity}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => handleUpdateQty(item.product._id, 0)}
                  >
                    <Icon name="delete-outline" size={22} color="#adb5bd" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.billContainer}>
              <Text style={styles.billTitle}>Bill Details</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{cart.totalAmount}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValueFree}>FREE</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.billRow}>
                <Text style={styles.grandTotalLabel}>To Pay</Text>
                <Text style={styles.grandTotalValue}>₹{cart.totalAmount}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {!isEmpty && (
        <View style={styles.footer}>
          <View style={styles.stickyTotal}>
            <Text style={styles.stickyPayable}>₹{cart.totalAmount}</Text>
            <Text style={styles.stickyViewBill}>VIEW DETAILED BILL</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.checkoutBtnText}>Place Order (COD)</Text>
            )}
            <Icon name="keyboard-arrow-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  shopNowBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  shopNowText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  addressSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemUnit: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 4,
  },
  stepBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginHorizontal: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  removeBtn: {
    padding: 8,
    marginLeft: 8,
  },
  billContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  billValueFree: {
    fontSize: 14,
    fontWeight: '700',
    color: '#28a745',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    width: width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    justifyContent: 'space-between',
  },
  stickyTotal: {
    flex: 1,
  },
  stickyPayable: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  stickyViewBill: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B6B',
    marginTop: 2,
  },
  checkoutBtn: {
    flex: 1.5,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
});

export default CartScreen;