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
  ImageIcon
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
    { path: '/users', icon: Users, label: 'Customers' },
    { path: '/ledger', icon: ShoppingBag, label: 'Ledger' },
  ];

  return (
    <div className="bg-gray-900 text-white w-72 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 px-8 py-10">
        <div className="bg-primary p-2 rounded-xl">
          <Milk className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">HANUMANT <span className="text-primary">DAIRY</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-red-900/20' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`
            }
          >
            <item.icon className={`w-5 h-5 ${item.path === window.location.pathname ? 'text-white' : ''}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={logout}
          className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl font-semibold text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;