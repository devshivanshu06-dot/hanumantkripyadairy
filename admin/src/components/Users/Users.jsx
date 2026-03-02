import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Users as UserIcon, Search, MapPin, Phone, Calendar } from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getCustomers();
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Customer Directory</h1>
        <p className="text-gray-500 mt-1">Manage all registered app users and their profiles.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name, phone or address..." 
          className="flex-1 border-none focus:ring-0 p-0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="bg-gray-100 p-4 rounded-2xl">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-right">
                <span className={`badge ${user.is_verified ? 'bg-success bg-opacity-10 text-success' : 'bg-gray-100 text-gray-400'}`}>
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <Phone size={16} />
                  <span>+91 {user.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-500 text-sm">
                  <MapPin size={16} className="mt-1 flex-shrink-0" />
                  <span className="line-clamp-2">{user.address || 'No address set'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <Calendar size={16} />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <button className="text-primary font-bold text-sm hover:underline">View Delivery History</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
