import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Users as UserIcon, Search, MapPin, Phone, Calendar, ExternalLink, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');

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

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.addresses?.[0]?.addressLine1?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
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
                  <div className="flex-1">
                    <span className="line-clamp-2">{user.addresses?.[0]?.addressLine1 || user.address || 'No address set'}</span>
                    {user.addresses?.[0]?.coordinates && (
                      <button 
                        onClick={() => {
                          setSelectedCoords(user.addresses[0].coordinates);
                          setSelectedAddress(user.addresses[0].addressLine1);
                          setShowMapModal(true);
                        }}
                        className="text-primary text-[10px] font-extrabold mt-1 inline-flex items-center gap-1 hover:underline uppercase tracking-wider"
                      >
                        <ExternalLink size={10} /> View Location on Map
                      </button>
                    )}
                  </div>
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

      {showMapModal && selectedCoords && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-zoomIn">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Customer Location</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedAddress}</p>
              </div>
              <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="h-[500px] relative">
              <MapContainer 
                center={[selectedCoords.latitude, selectedCoords.longitude]} 
                zoom={15} 
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[selectedCoords.latitude, selectedCoords.longitude]}>
                  <Popup>
                    <div className="font-bold text-sm">Delivery Point</div>
                    <div className="text-xs">{selectedAddress}</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            
            <div className="p-6 border-t flex justify-end">
              <button 
                onClick={() => setShowMapModal(false)}
                className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
