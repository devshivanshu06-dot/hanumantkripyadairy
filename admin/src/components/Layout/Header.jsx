import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Search } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 w-96">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search for orders, deliveries..." 
          className="bg-transparent border-none p-0 text-sm w-full focus:ring-0"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-100"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin User'}</p>
            <p className="text-xs font-semibold text-gray-400 capitalize">{user?.role || 'Administrator'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary bg-opacity-10 flex items-center justify-center text-primary font-bold">
            {user?.name?.[0] || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;