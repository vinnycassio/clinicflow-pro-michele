import { ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border-subtle">
      <div className="px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 animate-fade-in">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Início</span>
            </Link>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                {item.href ? (
                  <Link
                    to={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Title Row */}
        <div className="flex items-end justify-between gap-4">
          <div className="animate-fade-in-up">
            <h1 className="font-display text-display-1 text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-body text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3 animate-fade-in">{actions}</div>
          )}
        </div>
      </div>
    </header>
  );
}
