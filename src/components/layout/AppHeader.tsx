import { usePeriod } from '@/contexts/PeriodContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCooperative } from '@/contexts/CooperativeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Menu, Building2, User, Settings, LogOut, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { NotificationBell } from './NotificationBell';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const shortMonthNames = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function AppHeader({ title, subtitle, onMenuClick }: AppHeaderProps) {
  const { selectedPeriod, setSelectedPeriod, availablePeriods } = usePeriod();
  const { user, isAdmin, logout } = useAuth();
  const { selectedCooperative, setSelectedCooperative, cooperatives } = useCooperative();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile Header - Two rows */}
      {isMobile ? (
        <div className="flex flex-col">
          {/* Top row: Logo, Menu, Avatar */}
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              {onMenuClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMenuClick}
                  className="h-9 w-9"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              )}
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-heading text-base font-semibold text-foreground">
                  ContaCoop
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Cooperative Selector - Compact (always show if cooperatives exist) */}
              {cooperatives.length > 0 && (
                <div className="flex items-center gap-1">
                  <Select
                    value={selectedCooperative?.id || ''}
                    onValueChange={(value) => {
                      const coop = cooperatives.find(c => c.id === value);
                      if (coop) setSelectedCooperative(coop);
                    }}
                  >
                    <SelectTrigger className="w-[90px] border-border bg-card h-8 text-xs">
                      <SelectValue placeholder="Coop" />
                    </SelectTrigger>
                    <SelectContent portal={false}>
                      {cooperatives.map((coop) => (
                        <SelectItem key={coop.id} value={coop.id}>
                          {coop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate('/settings')}
                      title="Crear nueva cooperativa"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Period Selector - Compact */}
              <Select
                value={`${selectedPeriod.year}-${selectedPeriod.month}`}
                onValueChange={(value) => {
                  const [year, month] = value.split('-').map(Number);
                  setSelectedPeriod({ year, month });
                }}
              >
                <SelectTrigger className="w-[100px] border-border bg-card h-8 text-xs">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent portal={false}>
                  {availablePeriods.map((period) => (
                    <SelectItem
                      key={`${period.year}-${period.month}`}
                      value={`${period.year}-${period.month}`}
                    >
                      {shortMonthNames[period.month - 1]} {period.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Dropdown Menu - Mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Bottom row: Page title */}
          <div className="px-4 pb-3">
            <h1 className="font-heading text-lg font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
        </div>
      ) : (
        /* Desktop Header - Single row */
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="min-w-0 flex-shrink">
            <h1 className="font-heading text-lg lg:text-xl font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs lg:text-sm text-muted-foreground truncate">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {/* Cooperative Selector - Always show if cooperatives exist */}
            {cooperatives.length > 0 && (
              <div className="flex items-center gap-1 lg:gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground hidden lg:block" />
                <Select
                  value={selectedCooperative?.id || ''}
                  onValueChange={(value) => {
                    const coop = cooperatives.find(c => c.id === value);
                    if (coop) setSelectedCooperative(coop);
                  }}
                >
                  <SelectTrigger className="w-[120px] lg:w-[200px] border-border bg-card h-9 text-xs lg:text-sm">
                    <SelectValue placeholder="Cooperativa" />
                  </SelectTrigger>
                  <SelectContent portal={false}>
                    {cooperatives.map((coop) => (
                      <SelectItem key={coop.id} value={coop.id}>
                        {coop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => navigate('/settings')}
                    title="Crear nueva cooperativa"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Period Selector */}
            <div className="flex items-center gap-1 lg:gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground hidden lg:block" />
              <Select
                value={`${selectedPeriod.year}-${selectedPeriod.month}`}
                onValueChange={(value) => {
                  const [year, month] = value.split('-').map(Number);
                  setSelectedPeriod({ year, month });
                }}
              >
                <SelectTrigger className="w-[120px] lg:w-[180px] border-border bg-card h-9 text-xs lg:text-sm">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent portal={false}>
                  {availablePeriods.map((period) => (
                    <SelectItem
                      key={`${period.year}-${period.month}`}
                      value={`${period.year}-${period.month}`}
                    >
                      {monthNames[period.month - 1]} {period.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-border hover:bg-accent">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <Badge
                      variant={isAdmin ? 'default' : 'secondary'}
                      className="text-xs capitalize"
                    >
                      {isAdmin ? 'Administrador' : 'Socio'}
                    </Badge>
                  </div>
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </header>
  );
}
