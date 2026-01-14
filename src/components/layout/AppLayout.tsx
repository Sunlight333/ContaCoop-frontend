import { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar, MobileMenuButton } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { FloatingDotsCanvas } from '@/components/ui/particle-canvas';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  requireAdmin?: boolean;
  showCanvas?: boolean;
}

export function AppLayout({ children, title, subtitle, requireAdmin = false, showCanvas = true }: AppLayoutProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Check for collapsed state from sidebar (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const checkSidebar = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains('w-16'));
      }
    };

    const observer = new MutationObserver(checkSidebar);
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, [isMobile]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse-subtle">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Canvas Background */}
      {showCanvas && !isMobile && (
        <FloatingDotsCanvas dotCount={25} className="opacity-40" />
      )}

      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className={cn(
        'transition-all duration-300 relative z-10',
        // Desktop: margin for sidebar
        'md:ml-64',
        sidebarCollapsed && 'md:ml-16',
        // Mobile: no margin
        'ml-0'
      )}>
        <AppHeader
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 md:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
