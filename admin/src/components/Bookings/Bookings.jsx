import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Search, Edit2, Save, X, Filter } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ litres_per_day: '', payment_status: 'pending' });


  const fetchBookings = async () => {
    try {
      const response = await adminAPI.getBookings();
      setBookings(response.data);
      setFilteredBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customer_phone?.includes(searchTerm)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((booking) => booking.payment_status === filterStatus);
    }
    setFilteredBookings(filtered);
  }, [searchTerm, filterStatus, bookings]);

  

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    setEditForm({ litres_per_day: booking.litres_per_day, payment_status: booking.payment_status });
  };

  const handleSave = async (id) => {
    try {
      await adminAPI.updateBooking(id, {
        litres_per_day: parseFloat(editForm.litres_per_day),
        payment_status: editForm.payment_status,
      });
      await fetchBookings();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ litres_per_day: '', payment_status: 'pending' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Booking Management</h1>
        <div className="text-sm text-gray-600">Total Bookings: {bookings.length}</div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">ID</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Customer</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Phone</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Litres/Day</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Payment Status</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Amount</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">{booking.id}</td>
                    <td className="py-4 px-6 text-gray-800 font-medium">{booking.customer_name || 'N/A'}</td>
                    <td className="py-4 px-6 text-gray-700">{booking.customer_phone || 'N/A'}</td>
                    <td className="py-4 px-6">
                      {editingId === booking.id ? (
                        <input
                          type="number"
                          step="0.5"
                          value={editForm.litres_per_day}
                          onChange={(e) => setEditForm({ ...editForm, litres_per_day: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-20"
                        />
                      ) : (
                        <span>{booking.litres_per_day} L</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {editingId === booking.id ? (
                        <select
                          value={editForm.payment_status}
                          onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.payment_status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : booking.payment_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {booking.payment_status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-700">₹{booking.total_amount || 0}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {editingId === booking.id ? (
                          <>
                            <button
                              onClick={() => handleSave(booking.id)}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEdit(booking)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
