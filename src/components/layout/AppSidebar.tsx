import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  UserCog, 
  Settings,
  DollarSign,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
    permission: null,
  },
  {
    icon: Users,
    label: "Pacientes",
    path: "/pacientes",
    permission: "patients",
  },
  {
    icon: Calendar,
    label: "Agenda",
    path: "/agenda",
    permission: "appointments",
  },
  {
    icon: FileText,
    label: "Prontuários",
    path: "/prontuarios",
    permission: "medical_records",
  },  
  {
    icon: FileText,  
    label: 'Protocolos',
    path: '/protocolos', 
    permission: "medical_records",
  },
  {
    icon: Activity,
    label: "Tratamentos",
    path: "/tratamentos",
    permission: "treatments",
  },
  {
    icon: UserCog,
    label: "Profissionais",
    path: "/profissionais",
    permission: "admin",
  },
  {
    icon: DollarSign,
    label: "Financeiro",
    path: "/financeiro",
    permission: "financial",
  },
  {
    icon: Settings,
    label: "Configurações",
    path: "/configuracoes",
    permission: "admin",
  },
];

export const AppSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { authUser, hasPermission, hasRole } = useAuth();

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    if (item.permission === 'admin') return hasRole('admin');
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#2D5A7B] text-white z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A67C52] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">VC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">VLTRA CLINIC</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:bg-[#234560]"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#2D5A7B] text-white flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo - Desktop Only */}
        <div className="hidden lg:block p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#A67C52] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">VC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">VLTRA</h1>
              <p className="text-sm text-blue-200">CLINIC</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-16 lg:mt-0">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  isActive
                    ? "bg-[#234560] text-white"
                    : "text-blue-100 hover:bg-[#234560]/50"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#A67C52] rounded-r" />
                )}
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile - Desktop */}
        <div className="hidden lg:block p-4 border-t border-blue-700">
          <div className="flex items-center gap-3">
            <UserMenu />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {authUser?.profile?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-blue-200 truncate">
                {authUser?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
