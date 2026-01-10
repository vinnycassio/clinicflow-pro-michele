import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Activity,
  UserCog,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Pacientes",
    href: "/pacientes",
    icon: Users,
    badge: "127",
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    title: "Prontuários",
    href: "/prontuarios",
    icon: FileText,
  },
  {
    title: "Tratamentos",
    href: "/tratamentos",
    icon: Activity,
  },
  {
    title: "Profissionais",
    href: "/profissionais",
    icon: UserCog,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#2D5A7B] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A67C52] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">VC</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">VLTRA</h1>
            <p className="text-xs text-white/60">CLINIC</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#A67C52] rounded-r" />
              )}
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="bg-[#A67C52] text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-semibold">RM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Dr. Rafael Martins</p>
            <p className="text-xs text-white/60">Dermatologia</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
