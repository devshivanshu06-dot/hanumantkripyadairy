import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/apiService';
import { 
  Users, 
  ShoppingBag, 
  CalendarRange, 
  TrendingUp, 
  Package, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,Truck
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isTriggering, setIsTriggering] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeSubscriptions: 0,
    pendingOrders: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [customersRes, subsRes, ordersRes] = await Promise.all([
        adminAPI.getCustomers(),
        adminAPI.getSubscriptions(),
        adminAPI.getOrders(),
      ]);

      const customers = customersRes.data || [];
      const subscriptions = subsRes.data || [];
      const orders = ordersRes.data || [];

      const activeSubs = subscriptions.filter(s => s.status === 'active').length;
      const pending = orders.filter(o => o.status === 'Pending').length;

      // Calculate today's revenue (mock logic if no timestamp filtering on backend yet)
      const today = new Date().toDateString();
      const todayTotal = orders
        .filter(o => new Date(o.createdAt).toDateString() === today)
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setStats({
        totalCustomers: customers.length,
        activeSubscriptions: activeSubs,
        pendingOrders: pending,
        todayRevenue: todayTotal,
      });

      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleProcessMilk = async () => {
    const confirmTrigger = window.confirm("Are you sure you want to manually process today's deliveries?");
    if (!confirmTrigger) return;
    try {
      setIsTriggering(true);
      await adminAPI.triggerCron();
      alert('Daily deliveries processed successfully!');
      fetchDashboardData();
    } catch (error) {
      alert('Error processing deliveries');
    } finally {
      setIsTriggering(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, trend, trendUp, color }) => (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${trendUp ? 'text-success' : 'text-danger'}`}>
          {trend}
          {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-extrabold mt-1">{value}</h3>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          title="Total Customers" 
          value={stats.totalCustomers} 
          trend="+12%" 
          trendUp={true} 
          color="bg-blue-600" 
        />
        <StatCard 
          icon={CalendarRange} 
          title="Active Subs" 
          value={stats.activeSubscriptions} 
          trend="+5%" 
          trendUp={true} 
          color="bg-purple-600" 
        />
        <StatCard 
          icon={Clock} 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          trend="-2%" 
          trendUp={false} 
          color="bg-orange-600" 
        />
        <StatCard 
          icon={TrendingUp} 
          title="Today's Revenue" 
          value={`₹${stats.todayRevenue}`} 
          trend="+18%" 
          trendUp={true} 
          color="bg-emerald-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <button className="text-primary font-semibold text-sm hover:underline">View All</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-semibold">{order.user.name}</td>
                    <td className="font-bold text-gray-900">₹{order.totalAmount}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'Delivered' ? 'bg-success bg-opacity-10 text-success' :
                        order.status === 'Pending' ? 'bg-warning bg-opacity-10 text-orange-600' :
                        'bg-blue-600 bg-opacity-10 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => navigate('/products')}
              className="btn-primary w-full justify-center py-4 bg-gray-900 hover:bg-gray-800"
            >
              <Package className="w-5 h-5" />
              Manage Products
            </button>
            <button 
              onClick={handleProcessMilk}
              disabled={isTriggering}
              className={`btn-primary w-full justify-center py-4 ${isTriggering ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Truck className="w-5 h-5" />
              {isTriggering ? 'Processing...' : "Process Today's Milk"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;