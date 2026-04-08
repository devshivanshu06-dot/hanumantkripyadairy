import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { ArrowLeft, Wallet, MapPin, ShoppingBag, CreditCard, Calendar } from 'lucide-react';

const CustomerDetails = ({ customerId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchDetails();
  }, [customerId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCustomerDetails(customerId);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return <div>Customer not found</div>;

  const { customer, orders, transactions, subscriptions } = data;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-blue-600 transition mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Customers
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>
              <p className="text-gray-500">{customer.phone}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500">Joined</span>
              <span className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${customer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {customer.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-center">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Wallet Balance</p>
              <h2 className="text-3xl font-bold text-gray-800">₹{customer.walletBalance?.toFixed(2) || '0.00'}</h2>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Delivery Addresses</h2>
          </div>
          <div className="space-y-3">
            {customer.addresses && customer.addresses.length > 0 ? (
              customer.addresses.map((addr, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${addr.isDefault ? 'border-blue-200 bg-blue-50' : 'border-gray-100'}`}>
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">{addr.label} {addr.isDefault && '(Default)'}</p>
                  <p className="text-sm text-gray-700">{addr.addressLine1}, {addr.city}</p>
                  <p className="text-xs text-gray-500">{addr.pincode}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm italic">No addresses saved</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Orders History
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'transactions' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Wallet Transactions
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'subscriptions' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Active Subscriptions
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Items</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b border-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600 font-mono">{order._id.slice(-6)}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {order.items.map(item => `${item.product?.name} x${item.quantity}`).join(', ')}
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-gray-800">₹{order.totalAmount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-10">No orders found</p>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx._id} className="border-b border-gray-50">
                          <td className="py-3 px-4">
                            <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.type === 'credit' ? <CreditCard className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{tx.description}</td>
                          <td className={`py-3 px-4 text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-10">No transactions found</p>
              )}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub) => (
                    <div key={sub._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                             <img src={sub.product?.image} alt="" className="w-8 h-8 object-contain" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{sub.product?.name}</h4>
                            <p className="text-xs text-gray-500">{sub.frequency} • {sub.timeSlot}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">Starts: {new Date(sub.startDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-bold text-blue-900">{sub.quantity} {sub.product?.unit} / day</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-10">No active subscriptions</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
