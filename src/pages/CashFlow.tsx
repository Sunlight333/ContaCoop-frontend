import { AppLayout } from '@/components/layout/AppLayout';
import { usePeriod } from '@/contexts/PeriodContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, ArrowRight, ArrowDown, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { financialApi, downloadBlob } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';
import { toast } from 'sonner';

interface CashFlowEntry {
  id: string;
  description: string;
  category: 'operating' | 'investing' | 'financing';
  amount: number;
}

export default function CashFlow() {
  const { formatPeriod, selectedPeriod } = usePeriod();
  const { selectedCooperative } = useCooperative();
  const isMobile = useIsMobile();
  const [cashFlowData, setCashFlowData] = useState<CashFlowEntry[]>([]);
  const [summary, setSummary] = useState({ operating: 0, investing: 0, financing: 0, netCashFlow: 0 });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPeriod) return;
      setIsLoading(true);
      try {
        const [cashFlowResult, historyResult] = await Promise.all([
          financialApi.getCashFlow(selectedPeriod.year, selectedPeriod.month, selectedCooperative?.id),
          financialApi.getCashFlowHistory(6, selectedCooperative?.id)
        ]);

        if (cashFlowResult) {
          setCashFlowData(cashFlowResult.entries || []);
          setSummary(cashFlowResult.summary || { operating: 0, investing: 0, financing: 0, netCashFlow: 0 });
        }

        if (historyResult) {
          setTrendData(historyResult);
        }
      } catch (error) {
        console.error('Failed to fetch cash flow:', error);
        toast.error('Error al cargar el flujo de caja');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod, selectedCooperative]);

  const handleExport = async () => {
    if (!selectedPeriod) return;
    setIsExporting(true);
    try {
      const blob = await financialApi.exportCashFlow(
        selectedPeriod.year,
        selectedPeriod.month,
        selectedCooperative?.id
      );
      downloadBlob(blob, `flujo-caja-${selectedPeriod.year}-${selectedPeriod.month}.xlsx`);
      toast.success('Flujo de caja exportado exitosamente');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Error al exportar el flujo de caja');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  };

  // Group entries by category
  const operatingEntries = cashFlowData.filter(e => e.category === 'operating');
  const investingEntries = cashFlowData.filter(e => e.category === 'investing');
  const financingEntries = cashFlowData.filter(e => e.category === 'financing');

  // Use summary from API
  const { operating: operatingTotal, investing: investingTotal, financing: financingTotal, netCashFlow } = summary;

  // Chart data
  const chartData = [
    { name: 'Operación', value: operatingTotal, fill: 'hsl(var(--chart-1))' },
    { name: 'Inversión', value: investingTotal, fill: 'hsl(var(--chart-2))' },
    { name: 'Financiam.', value: financingTotal, fill: 'hsl(var(--chart-3))' },
  ];

  // Use trend data from API or fallback to current values
  const chartTrendData = trendData.length > 0 ? trendData : [
    { period: 'Actual', operating: operatingTotal, investing: investingTotal, financing: financingTotal, net: netCashFlow },
  ];

  const CashFlowSection = ({
    title,
    entries,
    total,
    color
  }: {
    title: string;
    entries: CashFlowEntry[];
    total: number;
    color: string;
  }) => (
    <Card className="hover-lift animated-border transition-smooth">
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-sm md:text-lg font-heading flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 md:h-3 md:w-3 rounded-full', color)} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        <div className="space-y-1 md:space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-1.5 md:py-2 border-b border-border last:border-0"
            >
              <span className="text-xs md:text-sm text-foreground truncate mr-2">{entry.description}</span>
              <span className={cn(
                'font-mono text-xs md:text-sm font-medium whitespace-nowrap',
                entry.amount >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {entry.amount >= 0 ? '+' : ''}{isMobile ? formatCurrencyCompact(entry.amount) : formatCurrency(entry.amount)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t-2 border-border flex items-center justify-between">
          <span className="font-medium text-sm md:text-base text-foreground">Subtotal</span>
          <span className={cn(
            'font-heading text-base md:text-lg font-bold',
            total >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {total >= 0 ? '+' : ''}{isMobile ? formatCurrencyCompact(total) : formatCurrency(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout title="Estado de Flujo de Caja" subtitle={`Análisis de flujo de caja para ${formatPeriod()}`}>
      <div className="space-y-4 md:space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all duration-300 hover-glow',
              netCashFlow >= 0 ? 'bg-success/10' : 'bg-destructive/10'
            )}>
              {netCashFlow >= 0 ? (
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
              )}
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Flujo de Caja Neto</p>
                <p className={cn(
                  'font-heading text-lg md:text-xl font-bold',
                  netCashFlow >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
            onClick={handleExport}
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline">Exportar a Excel</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>

        {/* Net Cash Flow Summary - Moved to Top */}
        <Card className="bg-muted/30 animate-slide-up hover-glow">
          <CardContent className="py-4 md:py-6">
            {/* Mobile: Vertical stack */}
            <div className="flex md:hidden flex-col items-center gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Operación</p>
                <p className={cn(
                  'font-heading text-lg font-bold',
                  operatingTotal >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrencyCompact(operatingTotal)}
                </p>
              </div>
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Inversión</p>
                <p className={cn(
                  'font-heading text-lg font-bold',
                  investingTotal >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrencyCompact(investingTotal)}
                </p>
              </div>
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Financiamiento</p>
                <p className={cn(
                  'font-heading text-lg font-bold',
                  financingTotal >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrencyCompact(financingTotal)}
                </p>
              </div>
              <div className="w-full h-px bg-border my-1" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Flujo de Caja Neto</p>
                <p className={cn(
                  'font-heading text-xl font-bold',
                  netCashFlow >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrency(netCashFlow)}
                </p>
              </div>
            </div>

            {/* Desktop: Horizontal layout */}
            <div className="hidden md:flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Operación</p>
                <p className={cn(
                  'font-heading text-xl font-bold',
                  operatingTotal >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrency(operatingTotal)}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Inversión</p>
                <p className={cn(
                  'font-heading text-xl font-bold',
                  investingTotal >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrency(investingTotal)}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Financiamiento</p>
                <p className={cn(
                  'font-heading text-xl font-bold',
                  financingTotal >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrency(financingTotal)}
                </p>
              </div>
              <div className="h-12 w-px bg-border mx-2" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Flujo de Caja Neto</p>
                <p className={cn(
                  'font-heading text-2xl font-bold',
                  netCashFlow >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrency(netCashFlow)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Category Comparison */}
          <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg font-heading">Flujo de Caja por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-[200px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: isMobile ? -5 : 10, right: 10 }}>
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
                      formatter={(value: number) => [formatCurrency(value), 'Monto']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trend Chart */}
          <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.15s' }}>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg font-heading">Tendencia del Flujo de Caja</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <div className="h-[200px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartTrendData} margin={{ left: isMobile ? -15 : 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="period"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="net"
                      name="Flujo Neto"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-4))', strokeWidth: 2, r: isMobile ? 2 : 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cash Flow Sections */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3 animate-stagger">
          <CashFlowSection
            title="Actividades de Operación"
            entries={operatingEntries}
            total={operatingTotal}
            color="bg-chart-1"
          />
          <CashFlowSection
            title="Actividades de Inversión"
            entries={investingEntries}
            total={investingTotal}
            color="bg-chart-2"
          />
          <CashFlowSection
            title="Actividades de Financiamiento"
            entries={financingEntries}
            total={financingTotal}
            color="bg-chart-3"
          />
        </div>
      </div>
    </AppLayout>
  );
}
