'use client';

import { Bell, User } from 'lucide-react';

function Navbar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
          <span className="text-2xl font-bold text-blue-600">M</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">MiTienda</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <Bell className="w-6 h-6 text-white" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-medium hidden md:block">Usuario</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;