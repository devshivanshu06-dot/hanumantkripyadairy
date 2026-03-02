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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';
import { subscriptionAPI } from '../utils/api';

const ProductScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState('Morning');
  const [frequency, setFrequency] = useState('daily');

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(product._id, quantity);
      Alert.alert('Success', 'Added to cart successfully!', [
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
        { text: 'Continue Shopping', style: 'cancel' }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const subData = {
        product: product._id,
        quantity,
        frequency,
        timeSlot,
        startDate: new Date(),
      };
      await subscriptionAPI.createSubscription(subData);
      Alert.alert('Success', 'Subscription active! Fresh milk will reach you daily.', [
        { text: 'My Subscriptions', onPress: () => navigation.navigate('Schedule') },
        { text: 'OK' }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: product.image || 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
            style={styles.productImage} 
          />
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.priceText}>₹{product.price} <Text style={styles.unitText}>/ {product.unit}</Text></Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          <View style={styles.qtySection}>
            <Text style={styles.sectionTitle}>Select Quantity</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Icon name="remove" size={24} color="#FF6B6B" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQuantity(quantity + 1)}>
                <Icon name="add" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          {product.isSubscriptionAvailable && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Slot</Text>
                <View style={styles.optionsRow}>
                  {['Morning', 'Evening'].map(slot => (
                    <TouchableOpacity 
                      key={slot} 
                      style={[styles.optionBtn, timeSlot === slot && styles.optionBtnActive]}
                      onPress={() => setTimeSlot(slot)}
                    >
                      <Text style={[styles.optionText, timeSlot === slot && styles.optionTextActive]}>{slot}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frequency</Text>
                <View style={styles.optionsRow}>
                  {['daily', 'alternate'].map(freq => (
                    <TouchableOpacity 
                      key={freq} 
                      style={[styles.optionBtn, frequency === freq && styles.optionBtnActive]}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text style={[styles.optionText, frequency === freq && styles.optionTextActive]}>
                        {freq === 'daily' ? 'Daily' : 'Alternate Days'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {product.isSubscriptionAvailable ? (
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={handleSubscribe}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Icon name="event-repeat" size={20} color="white" />
                <Text style={styles.primaryBtnText}>Start Subscription</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={handleAddToCart}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Icon name="add-shopping-cart" size={20} color="white" />
                <Text style={styles.primaryBtnText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    height: 300,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  detailsSection: {
    padding: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF6B6B',
    marginBottom: 16,
  },
  unitText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  qtySection: {
    marginBottom: 32,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 16,
    width: 160,
    justifyContent: 'space-between',
  },
  qtyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  optionBtnActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF0F0',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  optionTextActive: {
    color: '#FF6B6B',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  primaryBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ProductScreen;