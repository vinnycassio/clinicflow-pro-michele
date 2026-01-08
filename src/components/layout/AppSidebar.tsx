import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pacientes", url: "/pacientes", icon: Users, badge: "127" },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Prontuários", url: "/prontuarios", icon: FileText },
  { title: "Tratamentos", url: "/tratamentos", icon: Stethoscope },
  { title: "Profissionais", url: "/profissionais", icon: UserCog },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "sidebar-gradient flex flex-col h-screen sticky top-0 transition-all duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-5 py-6 border-b border-sidebar-border/30",
        collapsed && "justify-center px-3"
      )}>
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/90 animate-pulse-glow">
          <Sparkles className="w-5 h-5 text-secondary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-display text-xl font-semibold text-sidebar-foreground tracking-tight">
              VLTRA
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
              Clinic
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.url;
            const Icon = item.icon;

            const linkContent = (
              <NavLink
                to={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "sidebar-item-active bg-sidebar-accent/50 text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold rounded-full bg-secondary/80 text-secondary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );

            return (
              <li key={item.title} className="animate-slide-in-left" style={{ animationDelay: `${index * 50}ms` }}>
                {collapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.title}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-secondary text-secondary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className={cn(
        "border-t border-sidebar-border/30 p-4",
        collapsed && "px-3"
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <Avatar className="w-10 h-10 border-2 border-secondary/50">
              <AvatarImage src="/placeholder.svg" alt="Dr. Rafael Martins" />
              <AvatarFallback className="bg-secondary/80 text-secondary-foreground font-medium text-sm">
                RM
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Dr. Rafael Martins
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                Dermatologia
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Avatar className="w-10 h-10 mx-auto cursor-pointer border-2 border-secondary/50 transition-transform hover:scale-105">
                <AvatarImage src="/placeholder.svg" alt="Dr. Rafael Martins" />
                <AvatarFallback className="bg-secondary/80 text-secondary-foreground font-medium text-sm">
                  RM
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">Dr. Rafael Martins</p>
              <p className="text-xs text-muted-foreground">Dermatologia</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-premium-sm text-muted-foreground hover:text-foreground hover:bg-card"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>
    </aside>
  );
}
