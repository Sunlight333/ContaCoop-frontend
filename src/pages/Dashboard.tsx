import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/ui/kpi-card';
import { useAuth } from '@/contexts/AuthContext';
import { usePeriod } from '@/contexts/PeriodContext';
import { useCooperative } from '@/contexts/CooperativeContext';
import { DollarSign, TrendingUp, PieChart, Wallet, Upload, Clock, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { financialApi, uploadApi } from '@/services/api';
import { toast } from 'sonner';

const kpiIcons = [DollarSign, Wallet, TrendingUp, PieChart];

// Spanish labels for KPIs
const kpiLabelsES: Record<string, string> = {
  'Total Assets': 'Activos Totales',
  'Net Income': 'Ingreso Neto',
  'Cash Flow': 'Flujo de Caja',
  'Debt Ratio': 'Ratio de Deuda',
};

// Spanish labels for ratios
const ratioLabelsES: Record<string, string> = {
  'Current Ratio': 'Ratio Corriente',
  'Debt to Assets': 'Deuda sobre Activos',
  'Return on Equity': 'Rentabilidad del Patrimonio',
  'Operating Margin': 'Margen Operativo',
};

const ratioDescriptionsES: Record<string, string> = {
  'Current Ratio': 'Capacidad de pago a corto plazo',
  'Debt to Assets': 'Nivel de endeudamiento',
  'Return on Equity': 'Rentabilidad para los socios',
  'Operating Margin': 'Eficiencia operativa',
};

interface KPI {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'percentage' | 'number';
}

interface Ratio {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface UploadRecord {
  id: string;
  period: string;
  date: string;
  status: 'success' | 'partial' | 'failed';
  modules: string[];
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const { formatPeriod, selectedPeriod } = usePeriod();
  const { selectedCooperative } = useCooperative();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [cashFlowByCategory, setCashFlowByCategory] = useState<{ name: string; value: number }[]>([]);
  const [ratios, setRatios] = useState<Ratio[]>([]);
  const [ratioTrendData, setRatioTrendData] = useState<any[]>([]);
  const [lastUpload, setLastUpload] = useState<UploadRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPeriod) return;
      setIsLoading(true);
      try {
        // Build promises array - upload history only for admins
        const promises = [
          financialApi.getDashboardKPIs(selectedPeriod.year, selectedPeriod.month, selectedCooperative?.id),
          financialApi.getCashFlow(selectedPeriod.year, selectedPeriod.month, selectedCooperative?.id),
          financialApi.getFinancialRatios(selectedPeriod.year, selectedPeriod.month, selectedCooperative?.id),
          financialApi.getRatioHistory(6, selectedCooperative?.id),
        ];

        // Only fetch upload history for admins
        if (isAdmin) {
          promises.push(uploadApi.getHistory(selectedCooperative?.id));
        }

        const results = await Promise.all(promises);
        const [kpisData, cashFlowData, ratiosData, ratioHistory] = results;
        const uploadHistoryData = isAdmin ? results[4] : null;

        if (kpisData) setKpis(kpisData as KPI[]);

        if ((cashFlowData as any)?.summary) {
          setCashFlowByCategory([
            { name: 'Operación', value: (cashFlowData as any).summary.operating },
            { name: 'Inversión', value: (cashFlowData as any).summary.investing },
            { name: 'Financiamiento', value: (cashFlowData as any).summary.financing },
          ]);
        }

        if (ratiosData) setRatios(ratiosData as Ratio[]);

        // Transform ratio history for the chart
        if (ratioHistory && Array.isArray(ratioHistory)) {
          const transformedHistory = (ratioHistory as any[]).map((item: any) => {
            const transformed: any = { period: item.period };
            if (item.ratios && Array.isArray(item.ratios)) {
              item.ratios.forEach((ratio: any) => {
                // Map English names to Spanish for chart display
                if (ratio.name === 'Current Ratio') {
                  transformed['Ratio Corriente'] = ratio.value;
                } else if (ratio.name === 'Return on Equity') {
                  transformed['ROE'] = ratio.value;
                } else if (ratio.name === 'Debt to Assets') {
                  transformed['Deuda/Activos'] = ratio.value;
                } else if (ratio.name === 'Operating Margin') {
                  transformed['Margen Op.'] = ratio.value;
                }
              });
            }
            return transformed;
          });
          setRatioTrendData(transformedHistory);
        }
        if (uploadHistoryData && (uploadHistoryData as any[]).length > 0) {
          setLastUpload((uploadHistoryData as any[])[0]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Error al cargar el panel');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod, selectedCooperative, isAdmin]);

  return (
    <AppLayout title="Panel Principal" subtitle={`Resumen financiero de ${formatPeriod()}`}>
      <div className="space-y-4 md:space-y-6">
        {/* Admin Status Banner */}
        {isAdmin && lastUpload && (
          <Card
            className="bg-primary/5 border-primary/20 animate-slide-up hover-lift cursor-pointer"
            onClick={() => navigate('/upload')}
          >
            <CardContent className="py-3 md:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 animate-pulse-subtle">
                    <Upload className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Última Importación de Datos</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lastUpload.period} • {lastUpload.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={lastUpload.status === 'success' ? 'success' : lastUpload.status === 'failed' ? 'error' : 'warning'}
                    label={lastUpload.status === 'success' ? 'Completado' : lastUpload.status === 'failed' ? 'Fallido' : 'Parcial'}
                  />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards with staggered animation */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 animate-stagger">
          {kpis.map((kpi, index) => {
            const Icon = kpiIcons[index % kpiIcons.length];
            return (
              <KPICard
                key={kpi.id}
                label={kpiLabelsES[kpi.label] || kpi.label}
                value={kpi.value}
                previousValue={kpi.previousValue}
                trend={kpi.trend}
                format={kpi.format}
                icon={Icon}
                className="animated-border"
              />
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Cash Flow Chart */}
          <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg font-heading">Flujo de Caja por Actividad</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-[220px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowByCategory} layout="vertical" margin={{ left: isMobile ? -10 : 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      width={isMobile ? 70 : 90}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--chart-1))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ratio Trends Chart */}
          <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.15s' }}>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg font-heading">Tendencia de Ratios Clave</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-[220px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratioTrendData} margin={{ left: isMobile ? -15 : 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="period"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Ratio Corriente"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: isMobile ? 2 : 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ROE"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: isMobile ? 2 : 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats with staggered animation */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 animate-stagger">
          {ratios.map((ratio) => (
            <Card key={ratio.id} className="hover-lift animated-border transition-smooth">
              <CardContent className="pt-4 md:pt-5 px-3 md:px-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {ratioLabelsES[ratio.name] || ratio.name}
                    </p>
                    <p className="font-heading text-xl md:text-2xl font-bold text-foreground mt-1 animate-count">
                      {ratio.name.includes('Ratio') || ratio.name.includes('Assets')
                        ? ratio.value.toFixed(2)
                        : `${(ratio.value * 100).toFixed(1)}%`
                      }
                    </p>
                  </div>
                  <StatusBadge
                    status={ratio.trend === 'up' ? 'success' : ratio.trend === 'down' ? 'warning' : 'neutral'}
                    label={ratio.trend === 'up' ? '↑' : ratio.trend === 'down' ? '↓' : '→'}
                  />
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-2 line-clamp-2">
                  {ratioDescriptionsES[ratio.name] || ratio.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
