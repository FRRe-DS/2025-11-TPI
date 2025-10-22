import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={cn(
        'bg-gray-100 text-gray-800 border-r border-gray-300 transition-all duration-300 ease-in-out h-full flex flex-col',
        isOpen ? 'w-56' : 'w-16'
      )}
    >
      <div className="p-2">
        <button
          onClick={toggleSidebar}
          className={cn(
            "hover:bg-gray-200 rounded cursor-pointer transition-colors flex items-center p-2",
            isOpen ? "w-full" : "w-12"
          )}
        >
          <div className="w-8 flex-shrink-0 flex items-center justify-center">
            <Menu className="w-6 h-6" />
          </div>
          {isOpen && <span className="ml-3 whitespace-nowrap">Menú</span>}
        </button>
      </div>

      <nav className="flex-grow p-2 space-y-2">
        {/* dashboard */}
        <Link
          to="/dashboard"
          className="flex items-center py-3 px-2 rounded hover:bg-gray-200 transition-colors"
          title="Dashboard"
        >
          <div className="w-8 flex-shrink-0 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          {isOpen && <span className="ml-3 whitespace-nowrap">Dashboard</span>}
        </Link>

        {/* usuarios */}
        <Link
          to="/usuarios"
          className="flex items-center py-3 px-2 rounded hover:bg-gray-200 transition-colors"
          title="Usuarios"
        >
          <div className="w-8 flex-shrink-0 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          {isOpen && <span className="ml-3 whitespace-nowrap">Usuarios</span>}
        </Link>

        {/* configuración */}
        <Link
          to="/configuracion"
          className="flex items-center py-3 px-2 rounded hover:bg-gray-200 transition-colors"
          title="Configuración"
        >
          <div className="w-8 flex-shrink-0 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          {isOpen && <span className="ml-3 whitespace-nowrap">Configuración</span>}
        </Link>
      </nav>

      <div className="p-2 mt-auto">
        {/* cerrar Sesión */}
        <Link
          to="/"
          className="flex items-center py-3 px-2 rounded hover:bg-red-100 transition-colors"
          title="Cerrar Sesión"
        >
          <div className="w-8 flex-shrink-0 flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>
          {isOpen && <span className="ml-3 whitespace-nowrap">Cerrar Sesión</span>}
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;