import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { ShoppingBag, Search, Eye, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminAPI.updateOrderStatus(id, status);
      fetchOrders();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Orders Management</h1>
        <p className="text-gray-500 mt-1">Track and manage customer orders and deliveries.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex-1 w-full max-w-md">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input type="text" placeholder="Search orders by customer or ID..." className="flex-1 border-none focus:ring-0" />
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
          {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${
                filter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                <td>
                  <div className="font-semibold text-gray-900">{order.user.name}</div>
                  <div className="text-xs text-gray-500">{order.user.phone}</div>
                </td>
                <td>
                  <div className="text-sm">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </div>
                  <div className="text-xs text-gray-400 max-w-xs truncate">
                    {order.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}
                  </div>
                </td>
                <td className="font-bold text-gray-900">₹{order.totalAmount}</td>
                <td>
                  <span className="badge bg-green-100 text-green-700">{order.paymentType}</span>
                </td>
                <td>
                  <span className={`badge ${
                    order.status === 'delivered' ? 'bg-success bg-opacity-10 text-success' :
                    order.status === 'pending' ? 'bg-warning bg-opacity-10 text-orange-600' :
                    order.status === 'cancelled' ? 'bg-danger bg-opacity-10 text-danger' :
                    'bg-blue-600 bg-opacity-10 text-blue-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <button onClick={() => handleUpdateStatus(order._id, 'confirmed')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Confirm"><CheckCircle size={18} /></button>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => handleUpdateStatus(order._id, 'delivered')} className="p-2 text-success hover:bg-green-50 rounded-lg" title="Mark Delivered"><Truck size={18} /></button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button onClick={() => handleUpdateStatus(order._id, 'cancelled')} className="p-2 text-danger hover:bg-red-50 rounded-lg" title="Cancel"><XCircle size={18} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
