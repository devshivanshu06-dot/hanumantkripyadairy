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

  const handleTriggerCron = async () => {
    // const confirmTrigger = window.confirm("Are you sure you want to manually trigger the daily cron job?");
    // if (!confirmTrigger) return;
    try {
      setLoading(true);
      await adminAPI.triggerCron();
      alert('Daily cron triggered successfully! Orders have been generated.');
      fetchSubscriptions();
    } catch (error) {
      console.error('Trigger Cron error:', error);
      alert('Error triggering cron');
      setLoading(false);
    }
  };

  const filteredSubs = filter === 'all' 
    ? subscriptions 
    : subscriptions.filter(s => s.status === filter);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Active Subscriptions</h1>
          <p className="text-gray-500 mt-1">Monitor and manage daily recurring milk deliveries.</p>
        </div>
        <button
          onClick={handleTriggerCron}
          disabled={loading}
          className={`px-6 py-2.5 rounded-xl font-bold border-none transition-all duration-200 flex items-center gap-2 active:scale-95 shadow-sm active:shadow-none ${
            loading 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
          {loading ? 'Processing...' : 'Trigger Daily Cron'}
        </button>
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
              <tr key={sub._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">{sub.user?.name || 'Unknown'}</div>
                  <div className="text-xs font-semibold text-gray-400">{sub.user?.phone}</div>
                </td>
                <td className="py-4 px-6 font-bold text-gray-800">{sub.product?.name}</td>
                <td className="py-4 px-6 font-black text-gray-900">{sub.quantity} {sub.product?.unit}</td>
                <td className="py-4 px-6 capitalize font-semibold text-gray-700">{sub.frequency}</td>
                <td className="py-4 px-6 font-medium text-gray-600">{sub.timeSlot}</td>
                <td className="py-4 px-6">
                  <span className={`badge ${
                    sub.status === 'active' ? 'bg-success bg-opacity-10 text-success' :
                    sub.status === 'paused' ? 'bg-warning bg-opacity-10 text-orange-600' :
                    'bg-danger bg-opacity-10 text-danger'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {sub.status === 'paused' ? (
                      <button onClick={() => handleUpdateStatus(sub._id, 'active')} className="p-2 text-success hover:bg-green-50 rounded-lg transition-colors border-none" title="Resume"><Play size={18} fill="currentColor" /></button>
                    ) : sub.status === 'active' ? (
                      <button onClick={() => handleUpdateStatus(sub._id, 'paused')} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border-none" title="Pause"><Pause size={18} fill="currentColor" /></button>
                    ) : null}
                    {sub.status !== 'cancelled' && (
                      <button onClick={() => handleUpdateStatus(sub._id, 'cancelled')} className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors border-none" title="Cancel"><XCircle size={18} fill="currentColor" /></button>
                    ) }
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
