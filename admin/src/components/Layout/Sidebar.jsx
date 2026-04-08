import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  CalendarRange, 
  Truck, 
  Package,
  Milk,
  LogOut,
  ImageIcon,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/subscriptions', icon: CalendarRange, label: 'Subscriptions' },
    { path: '/orders', icon: Truck, label: 'Deliveries' },
    { path: '/banners', icon: ImageIcon, label: 'Banners' },
    { path: '/livestreams', icon: Activity, label: 'Live Preview' },
    { path: '/users', icon: Users, label: 'Customers' },
    { path: '/ledger', icon: ShoppingBag, label: 'Ledger' },
  ];

  return (
    <div className="bg-white border-r border-slate-100 text-slate-600 w-72 min-h-screen flex flex-col shadow-sm">
      <div className="flex items-center gap-3 px-8 py-10">
        <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20">
          <Milk className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-slate-900">
          HANUMANT <span className="text-primary">DIARY</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/25 translate-x-1 outline outline-4 outline-primary/5' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-primary hover:translate-x-1'
              }`
            }
          >
            <item.icon className={`w-5 h-5`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-3xl p-4 mb-4 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-xs font-bold text-slate-600">System Online</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;