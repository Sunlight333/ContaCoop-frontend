import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCooperative } from '@/contexts/CooperativeContext';
import { BarChart3, TrendingUp, Users, DollarSign, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationCard {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  path: string;
  iconBgColor: string;
  iconColor: string;
}

const navigationCards: NavigationCard[] = [
  {
    title: 'Balance General',
    subtitle: 'Estado financiero detallado',
    icon: BarChart3,
    path: '/balance-sheet',
    iconBgColor: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    title: 'Flujo de efectivo',
    subtitle: 'Movimiento de dinero',
    icon: TrendingUp,
    path: '/cash-flow',
    iconBgColor: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    title: 'Cuotas sociales',
    subtitle: 'Aportes de socios',
    icon: Users,
    path: '/membership-fees',
    iconBgColor: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    title: 'Ratios financieros',
    subtitle: 'Indicadores clave',
    icon: DollarSign,
    path: '/financial-ratios',
    iconBgColor: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
];

export default function Dashboard() {
  const { logout } = useAuth();
  const { selectedCooperative } = useCooperative();
  const navigate = useNavigate();

  const cooperativeName = selectedCooperative?.name || 'Cooperativa';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppLayout title="" subtitle="">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header with greeting and logout */}
        <div className="flex items-start justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Hola {cooperativeName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Selecciona el informe que deseas consultar
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.path}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  'hover:shadow-lg hover:scale-[1.02] hover:border-primary/50',
                  'active:scale-[0.98]'
                )}
                onClick={() => navigate(card.path)}
              >
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center',
                      card.iconBgColor
                    )}>
                      <Icon className={cn('w-6 h-6 md:w-7 md:h-7', card.iconColor)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg text-foreground">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
