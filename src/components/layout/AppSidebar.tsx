import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Bell,
  Settings,
  DollarSign,
  PieChart,
  User,
  LogOut,
  Building2,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

const adminNavItems = [
  { to: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard },
  { to: '/upload', label: 'Carga de Datos', icon: Upload },
  { to: '/balance-sheet', label: 'Balance General', icon: FileSpreadsheet },
  { to: '/cash-flow', label: 'Flujo de Caja', icon: TrendingUp },
  { to: '/membership-fees', label: 'Cuotas de Socios', icon: DollarSign },
  { to: '/financial-ratios', label: 'Ratios Financieros', icon: PieChart },
  { to: '/users', label: 'Usuarios y Roles', icon: Users },
  { to: '/notifications', label: 'Notificaciones', icon: Bell },
  { to: '/profile', label: 'Mi Perfil', icon: User },
  { to: '/settings', label: 'Configuración', icon: Settings },
];

const socioNavItems = [
  { to: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard },
  { to: '/balance-sheet', label: 'Balance General', icon: FileSpreadsheet },
  { to: '/cash-flow', label: 'Flujo de Caja', icon: TrendingUp },
  { to: '/membership-fees', label: 'Cuotas de Socios', icon: DollarSign },
  { to: '/financial-ratios', label: 'Ratios Financieros', icon: PieChart },
  { to: '/profile', label: 'Mi Perfil', icon: User },
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({ mobileOpen = false, onMobileClose }: AppSidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const navItems = isAdmin ? adminNavItems : socioNavItems;

  // Close mobile menu on navigation
  useEffect(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center justify-between border-b border-sidebar-border',
        mobile ? 'px-4' : 'px-4'
      )}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-sidebar-primary" />
            <span className="font-heading text-lg font-semibold text-sidebar-primary-foreground">
              ContaCoop
            </span>
          </div>
        )}
        {collapsed && !mobile && <Building2 className="mx-auto h-7 w-7 text-sidebar-primary" />}
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              collapsed && 'mx-auto'
            )}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={mobile ? onMobileClose : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {(!collapsed || mobile) && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info & Logout */}
      <div className="border-t border-sidebar-border p-4">
        {(!collapsed || mobile) && (
          <div className="mb-3 px-1">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {user?.role === 'admin' ? 'Administrador' : 'Socio'}
            </p>
          </div>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed && !mobile && 'justify-center px-0'
              )}
            >
              <LogOut className="h-5 w-5" />
              {(!collapsed || mobile) && <span>Cerrar Sesión</span>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>Cerrar Sesión</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );

  // Mobile: Sheet/Drawer
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de Navegación</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <SidebarContent mobile />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden md:flex h-screen flex-col bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <SidebarContent />
    </aside>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="md:hidden h-10 w-10"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Abrir menú</span>
    </Button>
  );
}
