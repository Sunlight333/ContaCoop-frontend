import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePeriod } from '@/contexts/PeriodContext';
import { useCooperative } from '@/contexts/CooperativeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Download, TrendingUp, TrendingDown, Minus, Info, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { financialApi, downloadBlob } from '@/services/api';
import { toast } from 'sonner';

interface RatioData {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  history: { period: string; value: number }[];
}

const ratioDescriptions: Record<string, string> = {
  'Current Ratio': 'Un ratio mayor indica mejor capacidad de pago a corto plazo. Ideal: > 1.5',
  'Debt to Assets': 'Menor es mejor - indica menos dependencia de deuda. Ideal: < 0.5',
  'Return on Equity': 'Mayor es mejor - muestra eficiencia en generación de ganancias. Ideal: > 10%',
  'Operating Margin': 'Mayor es mejor - muestra eficiencia operativa. Ideal: > 15%',
  'Ratio Corriente': 'Un ratio mayor indica mejor capacidad de pago a corto plazo. Ideal: > 1.5',
  'Deuda sobre Activos': 'Menor es mejor - indica menos dependencia de deuda. Ideal: < 0.5',
  'Rentabilidad del Patrimonio': 'Mayor es mejor - muestra eficiencia en generación de ganancias. Ideal: > 10%',
  'Margen Operativo': 'Mayor es mejor - muestra eficiencia operativa. Ideal: > 15%',
};

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

export default function FinancialRatios() {
  const { formatPeriod, selectedPeriod } = usePeriod();
  const { selectedCooperative } = useCooperative();
  const isMobile = useIsMobile();

  const [ratios, setRatios] = useState<RatioData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPeriod) return;
      setIsLoading(true);
      try {
        const data = await financialApi.getFinancialRatios(
          selectedPeriod.year,
          selectedPeriod.month,
          selectedCooperative?.id
        );
        setRatios(data || []);
      } catch (error) {
        console.error('Failed to fetch ratios:', error);
        toast.error('Error al cargar los ratios financieros');
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
      const blob = await financialApi.exportRatios(
        selectedPeriod.year,
        selectedPeriod.month,
        selectedCooperative?.id
      );
      downloadBlob(blob, `ratios-financieros-${selectedPeriod.year}-${selectedPeriod.month}.xlsx`);
      toast.success('Ratios exportados exitosamente');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Error al exportar los ratios');
    } finally {
      setIsExporting(false);
    }
  };

  const formatValue = (ratio: RatioData) => {
    if (ratio.name.includes('Ratio') || ratio.name.includes('Assets') || ratio.name.includes('Corriente') || ratio.name.includes('Activos')) {
      return ratio.value.toFixed(2);
    }
    return `${(ratio.value * 100).toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const isTrendPositive = (ratio: RatioData) => {
    // For most ratios, up is good except for Debt to Assets
    if (ratio.name === 'Debt to Assets' || ratio.name === 'Deuda sobre Activos') {
      return ratio.trend === 'down';
    }
    return ratio.trend === 'up';
  };

  if (isLoading) {
    return (
      <AppLayout title="Ratios Financieros" subtitle={`Indicadores clave de rendimiento para ${formatPeriod()}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Ratios Financieros" subtitle={`Indicadores clave de rendimiento para ${formatPeriod()}`}>
      <div className="space-y-4 md:space-y-6">
        {/* Export Button */}
        <div className="flex justify-end animate-slide-up">
          <Button
            variant="outline"
            size="sm"
            className="transition-all duration-300 hover:scale-105"
            onClick={handleExport}
            disabled={isExporting || ratios.length === 0}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline">Exportar Reporte</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>

        {ratios.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay datos de ratios disponibles para este período
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Ratio Cards Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 animate-stagger">
              {ratios.map((ratio, index) => {
                const TrendIcon = getTrendIcon(ratio.trend);
                const isPositive = isTrendPositive(ratio);

                return (
                  <Card key={ratio.id} className="overflow-hidden hover-lift animated-border transition-smooth">
                    <CardHeader className="pb-2 px-4 md:px-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CardTitle className="text-base md:text-lg font-heading truncate">{ratio.name}</CardTitle>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="flex-shrink-0">
                                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>{ratioDescriptions[ratio.name] || ratio.description}</p>
                            </TooltipContent>
                          </UITooltip>
                        </div>
                        <StatusBadge
                          status={isPositive ? 'success' : ratio.trend === 'stable' ? 'neutral' : 'warning'}
                          label={isMobile
                            ? (ratio.trend === 'up' ? '↑' : ratio.trend === 'down' ? '↓' : '→')
                            : (ratio.trend === 'up' ? 'Mejorando' : ratio.trend === 'down' ? 'Declinando' : 'Estable')
                          }
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6">
                      <div className="flex items-end justify-between mb-3 md:mb-4">
                        <div>
                          <p className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                            {formatValue(ratio)}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{ratio.description}</p>
                        </div>
                        <div className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0',
                          isPositive ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        )}>
                          <TrendIcon className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Trend Chart */}
                      {ratio.history && ratio.history.length > 0 && (
                        <div className="h-[100px] md:h-[120px] mt-3 md:mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ratio.history} margin={{ left: isMobile ? -25 : -20, right: 5, top: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                              <XAxis
                                dataKey="period"
                                tick={{ fontSize: isMobile ? 9 : 10 }}
                                stroke="hsl(var(--muted-foreground))"
                                tickFormatter={(value) => value.split(' ')[0].slice(0, 3)}
                              />
                              <YAxis
                                tick={{ fontSize: isMobile ? 9 : 10 }}
                                stroke="hsl(var(--muted-foreground))"
                                domain={['auto', 'auto']}
                              />
                              <Tooltip
                                formatter={(value: number) => [
                                  ratio.name.includes('Ratio') || ratio.name.includes('Assets') || ratio.name.includes('Corriente') || ratio.name.includes('Activos')
                                    ? value.toFixed(2)
                                    : `${(value * 100).toFixed(1)}%`,
                                  ratio.name
                                ]}
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={chartColors[index % chartColors.length]}
                                strokeWidth={2}
                                dot={{ fill: chartColors[index % chartColors.length], strokeWidth: 2, r: isMobile ? 2 : 3 }}
                                activeDot={{ r: isMobile ? 4 : 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Benchmarks Card */}
            <Card className="animate-slide-up animated-border" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg font-heading">Puntos de Referencia de la Industria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                  {ratios.slice(0, 4).map((ratio) => {
                    let ideal = '';
                    let isGood = false;

                    if (ratio.name.includes('Current') || ratio.name.includes('Corriente')) {
                      ideal = '> 1.5';
                      isGood = ratio.value > 1.5;
                    } else if (ratio.name.includes('Debt') || ratio.name.includes('Deuda')) {
                      ideal = '< 50%';
                      isGood = ratio.value < 0.5;
                    } else if (ratio.name.includes('Return') || ratio.name.includes('ROE') || ratio.name.includes('Rentabilidad')) {
                      ideal = '> 10%';
                      isGood = ratio.value > 0.1;
                    } else if (ratio.name.includes('Margin') || ratio.name.includes('Margen')) {
                      ideal = '> 15%';
                      isGood = ratio.value > 0.15;
                    }

                    return (
                      <div key={ratio.id} className="p-3 md:p-4 rounded-lg bg-muted/30 border">
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{ratio.name}</p>
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <p className="text-xs md:text-sm">
                            <span className="hidden sm:inline">Referencia: </span>
                            <span className="font-medium">{ideal}</span>
                          </p>
                          <div className={cn(
                            'h-2 w-2 rounded-full flex-shrink-0',
                            isGood ? 'bg-success' : 'bg-warning'
                          )} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary / Recommendation */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-base md:text-lg font-heading text-blue-900 dark:text-blue-100">
                    Resumen Ejecutivo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-blue-100 dark:border-blue-900">
                  <div className="flex-shrink-0 mt-0.5">
                    {ratios.filter(r => {
                      if (r.name.includes('Corriente') || r.name.includes('Current')) return r.value > 1.5;
                      if (r.name.includes('Deuda') || r.name.includes('Debt')) return r.value < 0.5;
                      if (r.name.includes('Rentabilidad') || r.name.includes('Return') || r.name.includes('ROE')) return r.value > 0.1;
                      if (r.name.includes('Margen') || r.name.includes('Margin')) return r.value > 0.15;
                      return true;
                    }).length >= ratios.length * 0.7 ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm md:text-base text-blue-900 dark:text-blue-100">
                        {ratios.filter(r => {
                          if (r.name.includes('Corriente') || r.name.includes('Current')) return r.value > 1.5;
                          if (r.name.includes('Deuda') || r.name.includes('Debt')) return r.value < 0.5;
                          if (r.name.includes('Rentabilidad') || r.name.includes('Return') || r.name.includes('ROE')) return r.value > 0.1;
                          if (r.name.includes('Margen') || r.name.includes('Margin')) return r.value > 0.15;
                          return true;
                        }).length >= ratios.length * 0.7 ? 'Ratios en buen estado' : 'Ratio regular'}
                      </h4>
                      <StatusBadge
                        status={ratios.filter(r => {
                          if (r.name.includes('Corriente') || r.name.includes('Current')) return r.value > 1.5;
                          if (r.name.includes('Deuda') || r.name.includes('Debt')) return r.value < 0.5;
                          if (r.name.includes('Rentabilidad') || r.name.includes('Return') || r.name.includes('ROE')) return r.value > 0.1;
                          if (r.name.includes('Margen') || r.name.includes('Margin')) return r.value > 0.15;
                          return true;
                        }).length >= ratios.length * 0.7 ? 'success' : 'warning'}
                        label={ratios.filter(r => {
                          if (r.name.includes('Corriente') || r.name.includes('Current')) return r.value > 1.5;
                          if (r.name.includes('Deuda') || r.name.includes('Debt')) return r.value < 0.5;
                          if (r.name.includes('Rentabilidad') || r.name.includes('Return') || r.name.includes('ROE')) return r.value > 0.1;
                          if (r.name.includes('Margen') || r.name.includes('Margin')) return r.value > 0.15;
                          return true;
                        }).length >= ratios.length * 0.7 ? 'Saludable' : 'Necesita Atención'}
                      />
                    </div>
                    <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      La cooperativa muestra una situación financiera {ratios.filter(r => {
                        if (r.name.includes('Corriente') || r.name.includes('Current')) return r.value > 1.5;
                        if (r.name.includes('Deuda') || r.name.includes('Debt')) return r.value < 0.5;
                        if (r.name.includes('Rentabilidad') || r.name.includes('Return') || r.name.includes('ROE')) return r.value > 0.1;
                        if (r.name.includes('Margen') || r.name.includes('Margin')) return r.value > 0.15;
                        return true;
                      }).length >= ratios.length * 0.7 ? 'mayormente saludable. Se recomienda prestar atención al ratio de endeudamiento y continuar monitoreando todos los indicadores mensualmente para mantener la estabilidad financiera.' : 'que requiere atención. Se recomienda tomar medidas para mejorar los ratios que están por debajo de los puntos de referencia de la industria.'}
                    </p>
                  </div>
                </div>

                {/* Recommendation General */}
                <div className="p-3 md:p-4 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-sm md:text-base text-blue-900 dark:text-blue-100 mb-2">
                    Recomendación General
                  </h4>
                  <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    Se recomienda continuar monitoreando todos los indicadores mensualmente para mantener la estabilidad financiera.
                    Enfóquense en mantener un ratio de liquidez saludable, controlar el endeudamiento, y maximizar la rentabilidad operativa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
