import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Search, CheckCircle, Truck, XCircle, MapPin, PackageCheck, AlertCircle, X, ExternalLink, Navigation } from 'lucide-react';
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Today'); // 'Today', 'All', 'Pending', 'Delivered', 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedOrderCoords, setSelectedOrderCoords] = useState(null);
  const [selectedOrderAddress, setSelectedOrderAddress] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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

  const markAllTodayDelivered = async () => {
    const todayOrders = getFilteredOrders().filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
    if (todayOrders.length === 0) return alert('No pending orders to mark as delivered.');
    
    const confirm = window.confirm(`Are you sure you want to mark ${todayOrders.length} orders as delivered?`);
    if (!confirm) return;

    try {
      setLoading(true);
      for (const order of todayOrders) {
        await adminAPI.updateOrderStatus(order._id, 'Delivered');
      }
      fetchOrders();
      alert('All pending orders for today marked as Delivered!');
    } catch (error) {
      alert('Error updating some orders. Please refresh.');
      fetchOrders();
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.user?.name?.toLowerCase().includes(q) || 
        o._id.toLowerCase().includes(q) ||
        o.deliveryAddress?.toLowerCase().includes(q)
      );
    }

    if (filter === 'Today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(o => new Date(o.createdAt).toDateString() === today);
    } else if (filter !== 'All') {
      filtered = filtered.filter(o => o.status === filter);
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success bg-opacity-10 text-success';
      case 'Pending': return 'bg-warning bg-opacity-10 text-orange-600';
      case 'Packed': return 'bg-blue-600 bg-opacity-10 text-blue-600';
      case 'Out for Delivery': return 'bg-purple-600 bg-opacity-10 text-purple-600';
      case 'Cancelled': return 'bg-danger bg-opacity-10 text-danger';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Deliveries & Orders</h1>
          <p className="text-gray-500 mt-1">Manage today's deliveries, view addresses, and update statuses.</p>
        </div>
        {filter === 'Today' && (
          <button 
            onClick={markAllTodayDelivered}
            className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <PackageCheck className="w-5 h-5" />
            Mark All Today Delivered
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex-1 w-full max-w-md">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input 
            type="text" 
            placeholder="Search customer, ID, or address..." 
            className="flex-1 border-none focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto max-w-full">
          {['Today', 'All', 'Pending', 'Delivered', 'Cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition whitespace-nowrap ${
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
              <th>Customer & Address</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <div className="font-bold text-lg text-gray-700">No orders found</div>
                  <div>Try changing your search or filters.</div>
                </td>
              </tr>
            )}
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="font-mono text-xs text-gray-400">
                  <div className="font-bold mb-1 text-blue-500">
                    🔄 SUB
                  </div>
                  #{order._id.slice(-6).toUpperCase()}
                </td>
                <td>
                  <div className="font-bold text-gray-900 text-sm">{order.user?.name || 'Unknown User'}</div>
                  <a href={`tel:${order.user?.phone}`} className="text-xs text-blue-600 mb-2 font-bold hover:underline block">
                    {order.user?.phone || 'No Phone'}
                  </a>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-xs shadow-inner">
                    <div className="flex items-start gap-2">
                       <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                       <span className="text-xs font-bold text-gray-700 leading-relaxed">{order.deliveryAddress || 'No Address Provided'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-sm font-bold text-gray-800">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </div>
                  <div className="text-xs text-gray-500 max-w-[200px] truncate mt-1 bg-gray-50 p-1.5 rounded-md">
                    {order.items.map(i => `${i.product?.name || 'Product'} x${i.quantity}`).join(', ')}
                  </div>
                </td>
                <td>
                  <div className="font-black text-gray-900 text-base">₹{order.totalAmount}</div>
                  <div className="text-[10px] font-bold text-green-700 mt-1 uppercase tracking-wider bg-green-50 self-start px-2 py-0.5 rounded-md text-center max-w-[60px]">
                    {order.paymentType || 'Wallet'}
                  </div>
                </td>
                <td>
                  <span className={`badge ${getStatusColor(order.status)} px-3 py-1.5`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="flex flex-col gap-2">
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'Delivered')} 
                        className="p-2 bg-green-50 text-success hover:bg-green-100 rounded-lg shadow-sm font-bold text-xs flex items-center justify-center gap-1 w-full border border-green-200 transition" 
                        title="Mark Delivered"
                      >
                        <CheckCircle size={14} /> Deliver
                      </button>
                    )}
                    {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'Cancelled')} 
                        className="p-2 text-danger hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition font-bold text-xs flex items-center justify-center gap-1 w-full" 
                        title="Cancel Order"
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                    {order.deliveryCoordinates?.latitude && (
                      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                        <button 
                          onClick={() => {
                              setSelectedOrderCoords(order.deliveryCoordinates);
                              setSelectedOrderAddress(order.deliveryAddress);
                              setShowMapModal(true);
                          }}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg shadow-sm font-bold text-xs flex items-center justify-center gap-1 w-full hover:bg-gray-200 transition"
                          title="View on Map"
                        >
                          <ExternalLink size={14} /> View Map
                        </button>
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryCoordinates.latitude},${order.deliveryCoordinates.longitude}`, '_blank')}
                          className="p-2 bg-blue-900 text-white rounded-lg shadow-sm font-bold text-xs flex items-center justify-center gap-1 w-full hover:bg-black transition"
                          title="Open Google Maps Navigation"
                        >
                          <Navigation size={14} /> Navigate
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMapModal && selectedOrderCoords && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-zoomIn">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Delivery Location</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedOrderAddress}</p>
              </div>
              <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="h-[500px] relative">
              <MapContainer 
                center={[selectedOrderCoords.latitude, selectedOrderCoords.longitude]} 
                zoom={15} 
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[selectedOrderCoords.latitude, selectedOrderCoords.longitude]}>
                  <Popup>
                    <div className="font-bold text-sm">Delivery Point</div>
                    <div className="text-xs">{selectedOrderAddress}</div>
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

export default Orders;
