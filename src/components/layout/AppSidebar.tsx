import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  UserCog, 
  Settings,
  DollarSign
} from "lucide-react";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Users,
    label: "Pacientes",
    path: "/pacientes",
    badge: "127",
  },
  {
    icon: Calendar,
    label: "Agenda",
    path: "/agenda",
  },
  {
    icon: FileText,
    label: "Prontuários",
    path: "/prontuarios",
  },
  {
    icon: Activity,
    label: "Tratamentos",
    path: "/tratamentos",
  },
  {
    icon: UserCog,
    label: "Profissionais",
    path: "/profissionais",
  },
  {
    icon: DollarSign,
    label: "Financeiro",
    path: "/financeiro",
  },
  {
    icon: Settings,
    label: "Configurações",
    path: "/configuracoes",
  },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#2D5A7B] text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6">
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
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
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
              {item.badge && (
                <span className="ml-auto bg-[#A67C52] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A67C52] rounded-full flex items-center justify-center">
            <span className="text-white font-bold">RM</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Dr. Rafael Martins</p>
            <p className="text-xs text-blue-200">Dermatologia</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
