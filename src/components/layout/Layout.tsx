import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  Layout as LayoutIcon, 
  Users, 
  Settings, 
  BarChart4, 
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">FloorPlan Pro</h1>
        </div>
        
        <nav className="mt-4">
          <NavItem to="/dashboard" icon={<BarChart4 size={20} />} label="Dashboard" />
          <NavItem to="/floor-plans" icon={<LayoutIcon size={20} />} label="Floor Plans" />
          <NavItem to="/users" icon={<Users size={20} />} label="Users" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center text-gray-600 hover:text-red-600 text-sm"
          >
            <LogOut size={16} className="mr-1" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <Link
      to={to}
      className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};