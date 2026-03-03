import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { subscriptionAPI } from '../utils/api';

const ScheduleScreen = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getMySubscriptions();
      setSubscriptions(response.data.filter(s => s.status !== 'cancelled'));
    } catch (error) {
      console.error('Failed to fetch subscriptions', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePause = async (id) => {
    Alert.alert('Pause Subscription', 'How many days would you like to pause?', [
      { text: '3 Days', onPress: () => pauseSub(id, 3) },
      { text: '7 Days', onPress: () => pauseSub(id, 7) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const pauseSub = async (id, days) => {
    try {
      const pausedUntil = new Date();
      pausedUntil.setDate(pausedUntil.getDate() + days);
      await subscriptionAPI.pauseSubscription(id, pausedUntil);
      fetchSubscriptions();
      Alert.alert('Paused', `Subscription paused until ${pausedUntil.toLocaleDateString()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to pause subscription');
    }
  };

  const handleResume = async (id) => {
    try {
      await subscriptionAPI.resumeSubscription(id);
      fetchSubscriptions();
      Alert.alert('Resumed', 'Your subscription is back to active!');
    } catch (error) {
      Alert.alert('Error', 'Failed to resume subscription');
    }
  };

  const handleSkip = (id) => {
    Alert.alert('Skip Tomorrow', 'Are you sure you want to skip tomorrow\'s delivery?', [
      { text: 'Yes, Skip', onPress: () => skipTomorrow(id) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const skipTomorrow = async (id) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await subscriptionAPI.skipDate(id, tomorrow.toISOString());
      fetchSubscriptions();
      Alert.alert('Skipped', 'Tomorrow\'s delivery has been skipped.');
    } catch (error) {
      Alert.alert('Error', 'Failed to skip delivery');
    }
  };

  const handleCancel = (id) => {
    Alert.alert('Cancel Subscription', 'Are you sure? You will miss your fresh milk!', [
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelSub(id) },
      { text: 'No, Keep it', style: 'cancel' }
    ]);
  };

  const cancelSub = async (id) => {
    try {
      await subscriptionAPI.cancelSubscription(id);
      fetchSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Subscriptions</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSubscriptions(); }} />}
      >
        {subscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={64} color="#adb5bd" />
            <Text style={styles.emptyTitle}>No active subscriptions</Text>
            <Text style={styles.emptySubtitle}>Subscribe to your favorite milk and get daily delivery.</Text>
          </View>
        ) : (
          subscriptions.map((sub) => (
            <View key={sub._id} style={[styles.subCard, sub.status === 'paused' && styles.pausedCard]}>
              <View style={styles.subHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{sub.product.name}</Text>
                  <Text style={styles.subDetail}>{sub.quantity} {sub.product.unit} • {sub.frequency} • {sub.timeSlot}</Text>
                </View>
                <View style={[styles.statusBadge, styles[`status${sub.status}`]]}>
                  <Text style={styles.statusText}>{sub.status.toUpperCase()}</Text>
                </View>
              </View>

              {sub.status === 'paused' && sub.pausedUntil && (
                <View style={styles.pausedInfo}>
                  <Icon name="info-outline" size={16} color="#666" />
                  <Text style={styles.pausedText}>Paused until {new Date(sub.pausedUntil).toLocaleDateString()}</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                {sub.status === 'active' ? (
                  <TouchableOpacity style={styles.pauseBtn} onPress={() => handlePause(sub._id)}>
                    <Icon name="pause-circle-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.pauseBtnText}>Pause</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.resumeBtn} onPress={() => handleResume(sub._id)}>
                    <Icon name="play-circle-outline" size={20} color="#28a745" />
                    <Text style={styles.resumeBtnText}>Resume</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.skipBtn} onPress={() => handleSkip(sub._id)}>
                  <Icon name="event-busy" size={20} color="#666" />
                  <Text style={styles.skipBtnText}>Skip Tomorrow</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(sub._id)}>
                  <Icon name="cancel" size={20} color="#adb5bd" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Home')}>
        <Icon name="add" size={32} color="white" />
      </TouchableOpacity>
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  subCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  pausedCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subDetail: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusactive: {
    backgroundColor: '#E8F5E9',
  },
  statuspaused: {
    backgroundColor: '#FFF3E0',
  },
  statuscancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  pausedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pausedText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pauseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  pauseBtnText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 14,
  },
  resumeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  resumeBtnText: {
    color: '#28a745',
    fontWeight: '700',
    fontSize: 14,
  },
  skipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f3f5',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  skipBtnText: {
    color: '#495057',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelBtn: {
    padding: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default ScheduleScreen;