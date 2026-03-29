import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../utils/api';

const WalletScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'failed' or null

  // Replace with your actual Razorpay Key ID
  const RAZORPAY_KEY_ID = 'rzp_test_SVVehhmIpRbcIe';

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions()
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Failed to fetch wallet data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const handleAddMoney = async () => {
    setPaymentStatus(null);
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const options = {
      description: 'Wallet Recharge',
      image: 'https://cdn-icons-png.flaticon.com/512/3039/3039396.png',
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: amount * 100,
      name: 'Hanumant Kripa Dairy',
      prefill: {
        email: user?.email || '',
        contact: user?.phone || '',
        name: user?.name || ''
      },
      theme: { color: '#1e3a8a' }
    };

    RazorpayCheckout.open(options).then(async (data) => {
      setIsAddingMoney(true);
      try {
        const response = await walletAPI.addMoney({
          amount,
          description: 'Recharge using Razorpay',
          paymentId: data.razorpay_payment_id
        });
        
        setBalance(response.data.balance);
        setAmountToAdd('');
        Alert.alert('Success', `₹${amount} added successfully!`);
        fetchWalletData();
      } catch (error) {
        console.error('Failed to sync payment with backend', error);
        Alert.alert('Sync Error', "Payment was successful but we couldn't update your balance. Please contact support.");
      } finally {
        setIsAddingMoney(false);
      }
    }).catch((error) => {
      console.log('Payment failed: ', error);
      setPaymentStatus('failed'); // Set fallback state instead of Alert
    });
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Icon name="arrow-back-ios" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-blue-900 ml-2">My Wallet</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e3a8a']} />}
      >
        {/* Balance Card */}
        <View className="px-6 mt-6">
          <LinearGradient
            colors={['#1e3a8a', '#1e40af', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-[32px] p-8 shadow-xl shadow-blue-200"
          >
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">Available Balance</Text>
                <Text className="text-white text-4xl font-black">₹{balance.toFixed(2)}</Text>
              </View>
              <View className="bg-white/20 p-3 rounded-2xl">
                <Icon name="account-balance-wallet" size={32} color="white" />
              </View>
            </View>
            <View className="h-[1px] bg-white/10 mb-6" />
            <Text className="text-blue-100/80 text-xs font-semibold">Your balance is used for daily deliveries.</Text>
          </LinearGradient>
        </View>

        {/* Quick Add Money */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-black text-blue-950 mb-4 tracking-tight">Add Money</Text>
          <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-1 mb-4 border border-gray-100">
              <Text className="text-xl font-black text-blue-900 mr-2">₹</Text>
              <TextInput
                value={amountToAdd}
                onChangeText={setAmountToAdd}
                placeholder="Enter amount"
                keyboardType="numeric"
                className="flex-1 h-12 text-lg font-bold text-blue-950"
              />
            </View>
            
            <View className="flex-row justify-between mb-6">
              {[200, 500, 1000, 2000].map(amt => (
                <TouchableOpacity 
                   key={amt} 
                   onPress={() => setAmountToAdd(amt.toString())}
                   className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
                >
                  <Text className="text-blue-900 font-bold">+₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleAddMoney}
              disabled={isAddingMoney}
              className="bg-blue-900 py-4 rounded-2xl items-center shadow-lg shadow-blue-200"
            >
              {isAddingMoney ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black uppercase tracking-widest">Recharge Wallet</Text>
              )}
            </TouchableOpacity>

            {paymentStatus === 'failed' && (
              <View className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 items-center">
                 <View className="flex-row items-center mb-1">
                   <Icon name="error-outline" size={16} color="#dc2626" />
                   <Text className="text-red-600 font-black text-xs ml-2">Payment Failed</Text>
                 </View>
                 <Text className="text-red-500/80 text-[10px] font-bold text-center">We couldn't complete the recharge. Please try again or use another method.</Text>
                 <TouchableOpacity 
                   onPress={() => setPaymentStatus(null)}
                   className="mt-2"
                 >
                   <Text className="text-red-700 font-black text-[10px] uppercase border-b border-red-700">Dismiss</Text>
                 </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Transaction History */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-black text-blue-950 tracking-tight">Recent Transactions</Text>
            <TouchableOpacity>
              <Text className="text-blue-900 font-bold text-xs">View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <View key={tx._id} className="bg-white rounded-3xl p-4 mb-3 flex-row items-center border border-gray-50 shadow-xs">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Icon 
                    name={tx.type === 'credit' ? 'trending-up' : 'trending-down'} 
                    size={24} 
                    color={tx.type === 'credit' ? '#16a34a' : '#dc2626'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-blue-950">{tx.description}</Text>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-base font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </Text>
                  <Text className="text-[8px] font-black text-gray-300 uppercase">{tx.status}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white rounded-3xl p-10 items-center border border-gray-100 border-dashed">
               <Icon name="history" size={48} color="#cbd5e1" />
               <Text className="text-gray-400 font-bold mt-2">No transactions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WalletScreen;
