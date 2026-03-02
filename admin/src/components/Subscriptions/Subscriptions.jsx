import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { CalendarRange, Search, Pause, Play, CheckCircle, XCircle } from 'lucide-react';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await adminAPI.getSubscriptions();
      setSubscriptions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminAPI.updateSubscriptionStatus(id, status);
      fetchSubscriptions();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const filteredSubs = filter === 'all' 
    ? subscriptions 
    : subscriptions.filter(s => s.status === filter);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Active Subscriptions</h1>
        <p className="text-gray-500 mt-1">Monitor and manage daily recurring milk deliveries.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex-1 w-full max-w-md">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input type="text" placeholder="Search by customer phone or name..." className="flex-1 border-none focus:ring-0" />
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
          {['all', 'active', 'paused', 'cancelled'].map((f) => (
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
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Frequency</th>
              <th>Slot</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.map((sub) => (
              <tr key={sub._id}>
                <td>
                  <div className="font-semibold text-gray-900">{sub.user.name}</div>
                  <div className="text-xs text-gray-500">{sub.user.phone}</div>
                </td>
                <td className="font-medium text-gray-700">{sub.product.name}</td>
                <td className="font-bold">{sub.quantity} {sub.product.unit}</td>
                <td className="capitalize">{sub.frequency}</td>
                <td>{sub.timeSlot}</td>
                <td>
                  <span className={`badge ${
                    sub.status === 'active' ? 'bg-success bg-opacity-10 text-success' :
                    sub.status === 'paused' ? 'bg-warning bg-opacity-10 text-orange-600' :
                    'bg-danger bg-opacity-10 text-danger'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {sub.status === 'paused' ? (
                      <button onClick={() => handleUpdateStatus(sub._id, 'active')} className="p-2 text-success hover:bg-green-50 rounded-lg" title="Resume"><Play size={18} /></button>
                    ) : sub.status === 'active' ? (
                      <button onClick={() => handleUpdateStatus(sub._id, 'paused')} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Pause"><Pause size={18} /></button>
                    ) : null}
                    {sub.status !== 'cancelled' && (
                      <button onClick={() => handleUpdateStatus(sub._id, 'cancelled')} className="p-2 text-danger hover:bg-red-50 rounded-lg" title="Cancel"><XCircle size={18} /></button>
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

export default Subscriptions;
