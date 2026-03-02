// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   FlatList,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// // Mock Orders Data
// const mockOrders = [
//   {
//     id: '1',
//     orderNumber: 'ORD-2024-001',
//     date: '2024-01-15',
//     items: [
//       { name: 'Fresh Cow Milk', quantity: 1, price: 50 },
//       { name: 'Curd', quantity: 2, price: 40 },
//     ],
//     total: 130,
//     status: 'delivered',
//     schedule: 'Daily',
//     nextDelivery: 'Tomorrow, 7 AM',
//   },
//   {
//     id: '2',
//     orderNumber: 'ORD-2024-002',
//     date: '2024-01-14',
//     items: [
//       { name: 'Buffalo Milk', quantity: 1, price: 60 },
//       { name: 'Paneer', quantity: 1, price: 80 },
//     ],
//     total: 140,
//     status: 'scheduled',
//     schedule: 'Alternate Days',
//     nextDelivery: 'Today, 8 AM',
//   },
//   {
//     id: '3',
//     orderNumber: 'ORD-2024-003',
//     date: '2024-01-13',
//     items: [{ name: 'Toned Milk', quantity: 2, price: 45 }],
//     total: 90,
//     status: 'cancelled',
//     schedule: 'Weekly',
//     nextDelivery: 'Not Scheduled',
//   },
//   {
//     id: '4',
//     orderNumber: 'ORD-2024-004',
//     date: '2024-01-12',
//     items: [
//       { name: 'Fresh Cow Milk', quantity: 1, price: 50 },
//       { name: 'Ghee', quantity: 1, price: 200 },
//     ],
//     total: 250,
//     status: 'active',
//     schedule: 'Daily',
//     nextDelivery: 'Today, 7 AM',
//   },
// ];

// const OrderScreen = ({ navigation }) => {
//   const [activeTab, setActiveTab] = useState('active');

//   const filteredOrders = mockOrders.filter((order) => {
//     if (activeTab === 'active') return order.status === 'active' || order.status === 'scheduled';
//     if (activeTab === 'past') return order.status === 'delivered';
//     if (activeTab === 'cancelled') return order.status === 'cancelled';
//     return true;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'delivered':
//         return '#2ecc71';
//       case 'scheduled':
//         return '#3498db';
//       case 'active':
//         return '#f39c12';
//       case 'cancelled':
//         return '#e74c3c';
//       default:
//         return '#7f8c8d';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'delivered':
//         return 'check-circle';
//       case 'scheduled':
//         return 'schedule';
//       case 'active':
//         return 'local-shipping';
//       case 'cancelled':
//         return 'cancel';
//       default:
//         return 'help';
//     }
//   };

//   const renderOrderItem = ({ item }) => (
//     <TouchableOpacity style={styles.orderCard}>
//       {/* Order Header */}
//       <View style={styles.orderHeader}>
//         <View>
//           <Text style={styles.orderNumber}>{item.orderNumber}</Text>
//           <Text style={styles.orderDate}>{item.date}</Text>
//         </View>
//         <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
//           <Icon name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
//           <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
//             {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
//           </Text>
//         </View>
//       </View>

//       {/* Order Items */}
//       <View style={styles.itemsContainer}>
//         {item.items.map((product, index) => (
//           <View key={index} style={styles.itemRow}>
//             <Text style={styles.itemName}>{product.name}</Text>
//             <View style={styles.itemDetails}>
//               <Text style={styles.itemQuantity}>x{product.quantity}</Text>
//               <Text style={styles.itemPrice}>₹{product.price}</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* Schedule Info */}
//       <View style={styles.scheduleContainer}>
//         <Icon name="repeat" size={16} color="#3498db" />
//         <Text style={styles.scheduleText}>
//           {item.schedule} • Next: {item.nextDelivery}
//         </Text>
//       </View>

//       {/* Order Footer */}
//       <View style={styles.orderFooter}>
//         <Text style={styles.totalLabel}>Total</Text>
//         <Text style={styles.totalAmount}>₹{item.total}</Text>
//       </View>

//       {/* Action Buttons */}
//       <View style={styles.actionButtons}>
//         {item.status === 'active' && (
//           <>
//             <TouchableOpacity style={styles.secondaryButton}>
//               <Icon name="pause-circle" size={16} color="#e74c3c" />
//               <Text style={styles.secondaryButtonText}>Pause</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.secondaryButton}>
//               <Icon name="edit" size={16} color="#3498db" />
//               <Text style={styles.secondaryButtonText}>Modify</Text>
//             </TouchableOpacity>
//           </>
//         )}
//         <TouchableOpacity style={styles.primaryButton}>
//           <Icon name="receipt" size={16} color="white" />
//           <Text style={styles.primaryButtonText}>View Details</Text>
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={24} color="#2c3e50" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Orders</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
//           <Icon name="add-circle" size={24} color="#3498db" />
//         </TouchableOpacity>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'active' && styles.activeTab]}
//           onPress={() => setActiveTab('active')}
//         >
//           <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
//             Active
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'past' && styles.activeTab]}
//           onPress={() => setActiveTab('past')}
//         >
//           <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
//             Past Orders
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
//           onPress={() => setActiveTab('cancelled')}
//         >
//           <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>
//             Cancelled
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Orders List */}
//       <FlatList
//         data={filteredOrders}
//         renderItem={renderOrderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.ordersList}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Icon name="receipt-long" size={80} color="#ddd" />
//             <Text style={styles.emptyText}>No orders found</Text>
//             <TouchableOpacity
//               style={styles.emptyButton}
//               onPress={() => navigation.navigate('Products')}
//             >
//               <Text style={styles.emptyButtonText}>Start Shopping</Text>
//             </TouchableOpacity>
//           </View>
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 10,
//     alignItems: 'center',
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#3498db',
//   },
//   tabText: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     fontWeight: '600',
//   },
//   activeTabText: {
//     color: '#3498db',
//   },
//   ordersList: {
//     padding: 20,
//   },
//   orderCard: {
//     backgroundColor: 'white',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 15,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   orderNumber: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   orderDate: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     marginTop: 2,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 15,
//     gap: 5,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   itemsContainer: {
//     marginBottom: 15,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f8f9fa',
//   },
//   itemName: {
//     fontSize: 14,
//     color: '#2c3e50',
//     flex: 1,
//   },
//   itemDetails: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//   },
//   itemQuantity: {
//     fontSize: 14,
//     color: '#7f8c8d',
//   },
//   itemPrice: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#2c3e50',
//     minWidth: 60,
//     textAlign: 'right',
//   },
//   scheduleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#ebf5fb',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 15,
//     gap: 8,
//   },
//   scheduleText: {
//     fontSize: 14,
//     color: '#3498db',
//     fontWeight: '500',
//   },
//   orderFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     marginBottom: 15,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2c3e50',
//   },
//   totalAmount: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   primaryButton: {
//     flex: 1,
//     flexDirection: 'row',
//     backgroundColor: '#3498db',
//     paddingVertical: 12,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 8,
//   },
//   primaryButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   secondaryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     gap: 8,
//   },
//   secondaryButtonText: {
//     fontSize: 14,
//     color: '#2c3e50',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 100,
//   },
//   emptyText: {
//     fontSize: 18,
//     color: '#7f8c8d',
//     marginTop: 20,
//     marginBottom: 30,
//   },
//   emptyButton: {
//     backgroundColor: '#3498db',
//     paddingHorizontal: 30,
//     paddingVertical: 15,
//     borderRadius: 10,
//   },
//   emptyButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default OrderScreen;

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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Mock Cart Data
const mockCartItems = [
  {
    id: '1',
    name: 'Fresh Cow Milk',
    price: 50,
    quantity: 2,
    image: 'https://cdn-icons-png.flaticon.com/512/2516/2516436.png',
    unit: 'per liter',
    schedule: 'Daily',
    orderType: 'schedule', // 'one-time' or 'schedule'
  },
  {
    id: '2',
    name: 'Curd',
    price: 40,
    quantity: 1,
    image: 'https://cdn-icons-png.flaticon.com/512/3194/3194820.png',
    unit: '500g',
    schedule: 'Alternate Days',
    orderType: 'one-time',
  },
  {
    id: '3',
    name: 'Paneer',
    price: 80,
    quantity: 1,
    image: 'https://cdn-icons-png.flaticon.com/512/3194/3194820.png',
    unit: '250g',
    schedule: 'Weekly',
    orderType: 'schedule',
  },
];

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [selectedOrderType, setSelectedOrderType] = useState('one-time'); // 'one-time' or 'schedule'

  const updateQuantity = (id, change) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const deliveryCharge = cartItems.length > 0 ? 20 : 0;
  const discount = cartItems.length > 0 ? 15 : 0;
  const total = calculateSubtotal() + deliveryCharge - discount;

  const handleCheckout = () => {
    if (selectedOrderType === 'one-time') {
      Alert.alert(
        'Place One-time Order',
        'Do you want to place a one-time order for all items?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Place Order',
            onPress: () => {
              Alert.alert(
                'Order Placed!',
                'Your one-time order has been placed successfully!',
                [
                  {
                    text: 'View Orders',
                    onPress: () => navigation.navigate('Orders'),
                  },
                  {
                    text: 'OK',
                    style: 'default',
                  },
                ]
              );
            },
          },
        ]
      );
    } else {
      navigation.navigate('Schedule', { 
        orderType: 'schedule',
        cartItems: cartItems.filter(item => item.orderType === 'schedule')
      });
    }
  };

  const toggleOrderType = (itemId) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              orderType: item.orderType === 'one-time' ? 'schedule' : 'one-time',
            }
          : item
      )
    );
  };

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemUnit}>{item.unit}</Text>
        
        {/* Order Type Toggle */}
        <View style={styles.orderTypeToggle}>
          <TouchableOpacity
            style={[
              styles.typeOption,
              item.orderType === 'one-time' && styles.typeOptionSelected,
            ]}
            onPress={() => toggleOrderType(item.id)}
          >
            <Icon
              name="flash-on"
              size={14}
              color={item.orderType === 'one-time' ? 'white' : '#3498db'}
            />
            <Text
              style={[
                styles.typeText,
                item.orderType === 'one-time' && styles.typeTextSelected,
              ]}
            >
              One-time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeOption,
              item.orderType === 'schedule' && styles.typeOptionSelected,
            ]}
            onPress={() => toggleOrderType(item.id)}
          >
            <Icon
              name="calendar-today"
              size={14}
              color={item.orderType === 'schedule' ? 'white' : '#2ecc71'}
            />
            <Text
              style={[
                styles.typeText,
                item.orderType === 'schedule' && styles.typeTextSelected,
              ]}
            >
              Schedule
            </Text>
          </TouchableOpacity>
        </View>

        {/* Show Schedule Info if scheduled */}
        {item.orderType === 'schedule' && (
          <View style={styles.scheduleContainer}>
            <Icon name="repeat" size={14} color="#3498db" />
            <Text style={styles.scheduleText}>{item.schedule}</Text>
          </View>
        )}
        
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, -1)}
          >
            <Icon name="remove" size={20} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Icon name="add" size={20} color="#2c3e50" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Icon name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products')}>
          <Icon name="add" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {cartItems.length > 0 ? (
          <>
            {/* Cart Items */}
            <View style={styles.cartItemsContainer}>
              {cartItems.map(renderCartItem)}
            </View>

            {/* Order Type Selection for Checkout */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Checkout Options</Text>
              
              <View style={styles.checkoutTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkoutTypeButton,
                    selectedOrderType === 'one-time' && styles.checkoutTypeButtonSelected,
                  ]}
                  onPress={() => setSelectedOrderType('one-time')}
                >
                  <Icon
                    name="flash-on"
                    size={24}
                    color={selectedOrderType === 'one-time' ? 'white' : '#3498db'}
                  />
                  <View style={styles.checkoutTypeInfo}>
                    <Text
                      style={[
                        styles.checkoutTypeTitle,
                        selectedOrderType === 'one-time' && styles.checkoutTypeTitleSelected,
                      ]}
                    >
                      One-time Order
                    </Text>
                    <Text
                      style={[
                        styles.checkoutTypeDesc,
                        selectedOrderType === 'one-time' && styles.checkoutTypeDescSelected,
                      ]}
                    >
                      Get all items delivered once
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.checkoutTypeButton,
                    selectedOrderType === 'schedule' && styles.checkoutTypeButtonSelected,
                  ]}
                  onPress={() => setSelectedOrderType('schedule')}
                >
                  <Icon
                    name="calendar-today"
                    size={24}
                    color={selectedOrderType === 'schedule' ? 'white' : '#2ecc71'}
                  />
                  <View style={styles.checkoutTypeInfo}>
                    <Text
                      style={[
                        styles.checkoutTypeTitle,
                        selectedOrderType === 'schedule' && styles.checkoutTypeTitleSelected,
                      ]}
                    >
                      Schedule Delivery
                    </Text>
                    <Text
                      style={[
                        styles.checkoutTypeDesc,
                        selectedOrderType === 'schedule' && styles.checkoutTypeDescSelected,
                      ]}
                    >
                      Set up recurring deliveries
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.noteText}>
                Note: Only scheduled items will be included if you choose Schedule Delivery.
                One-time items will be ordered separately.
              </Text>
            </View>

            {/* Delivery Address */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="location-on" size={20} color="#e74c3c" />
                <Text style={styles.cardTitle}>Delivery Address</Text>
              </View>
              <Text style={styles.addressText}>
                123, Main Street, Mumbai - 400001
              </Text>
              <TouchableOpacity style={styles.changeAddressButton}>
                <Text style={styles.changeAddressText}>Change Address</Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{calculateSubtotal()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Charge</Text>
                <Text style={styles.summaryValue}>₹{deliveryCharge}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>
                  -₹{discount}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </View>

            {/* Order Summary by Type */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Breakdown</Text>
              
              {/* One-time Orders */}
              {cartItems.filter(item => item.orderType === 'one-time').length > 0 && (
                <View style={styles.typeSummary}>
                  <View style={styles.typeHeader}>
                    <Icon name="flash-on" size={16} color="#3498db" />
                    <Text style={styles.typeHeaderText}>One-time Orders</Text>
                  </View>
                  {cartItems
                    .filter(item => item.orderType === 'one-time')
                    .map(item => (
                      <View key={item.id} style={styles.typeItem}>
                        <Text style={styles.typeItemName}>{item.name}</Text>
                        <Text style={styles.typeItemQty}>x{item.quantity}</Text>
                        <Text style={styles.typeItemPrice}>₹{item.price * item.quantity}</Text>
                      </View>
                    ))}
                </View>
              )}

              {/* Scheduled Orders */}
              {cartItems.filter(item => item.orderType === 'schedule').length > 0 && (
                <View style={styles.typeSummary}>
                  <View style={styles.typeHeader}>
                    <Icon name="calendar-today" size={16} color="#2ecc71" />
                    <Text style={styles.typeHeaderText}>Scheduled Orders</Text>
                  </View>
                  {cartItems
                    .filter(item => item.orderType === 'schedule')
                    .map(item => (
                      <View key={item.id} style={styles.typeItem}>
                        <View>
                          <Text style={styles.typeItemName}>{item.name}</Text>
                          <Text style={styles.scheduleBadge}>{item.schedule}</Text>
                        </View>
                        <Text style={styles.typeItemQty}>x{item.quantity}</Text>
                        <Text style={styles.typeItemPrice}>₹{item.price * item.quantity}</Text>
                      </View>
                    ))}
                </View>
              )}
            </View>
          </>
        ) : (
          // Empty Cart
          <View style={styles.emptyContainer}>
            <Icon name="shopping-cart" size={100} color="#ddd" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>
              Add some delicious dairy products to get started!
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Checkout Button */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.footerTotalLabel}>Total:</Text>
            <Text style={styles.footerTotalValue}>₹{total}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.checkoutButton,
              selectedOrderType === 'one-time' ? styles.oneTimeButton : styles.scheduleButton
            ]} 
            onPress={handleCheckout}
          >
            <Icon 
              name={selectedOrderType === 'one-time' ? 'flash-on' : 'calendar-today'} 
              size={20} 
              color="white" 
            />
            <Text style={styles.checkoutButtonText}>
              {selectedOrderType === 'one-time' ? 'Place Order Now' : 'Schedule Delivery'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  cartItemsContainer: {
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  orderTypeToggle: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 5,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 5,
    marginRight: 5,
  },
  typeOptionSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  typeText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  typeTextSelected: {
    color: 'white',
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  scheduleText: {
    fontSize: 12,
    color: '#3498db',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemActions: {
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 15,
  },
  removeButton: {
    padding: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  checkoutTypeContainer: {
    gap: 10,
    marginBottom: 15,
  },
  checkoutTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 15,
    padding: 15,
    gap: 15,
  },
  checkoutTypeButtonSelected: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },
  checkoutTypeInfo: {
    flex: 1,
  },
  checkoutTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  checkoutTypeTitleSelected: {
    color: '#3498db',
  },
  checkoutTypeDesc: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  checkoutTypeDescSelected: {
    color: '#3498db',
  },
  noteText: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  addressText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 10,
  },
  changeAddressButton: {
    alignSelf: 'flex-start',
  },
  changeAddressText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  discountText: {
    color: '#2ecc71',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  typeSummary: {
    marginBottom: 15,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  typeHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 24,
  },
  typeItemName: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  scheduleBadge: {
    fontSize: 10,
    color: '#2ecc71',
    backgroundColor: '#e8f6f3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  typeItemQty: {
    fontSize: 12,
    color: '#7f8c8d',
    marginHorizontal: 10,
  },
  typeItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    minWidth: 60,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 5,
  },
  footerTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginLeft: 20,
  },
  oneTimeButton: {
    backgroundColor: '#e74c3c',
  },
  scheduleButton: {
    backgroundColor: '#2ecc71',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;