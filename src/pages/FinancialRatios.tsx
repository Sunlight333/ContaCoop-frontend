import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePeriod } from '@/contexts/PeriodContext';
import { useCooperative } from '@/contexts/CooperativeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, AlertCircle, HelpCircle, ArrowLeft, TrendingUp, FileText } from 'lucide-react';
import { exportToPdf } from '@/lib/pdf-export';
import { cn } from '@/lib/utils';
import { financialApi, downloadBlob } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface RatioData {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  history?: { period: string; value: number }[];
}

// Ratio configurations with Spanish names and evaluation criteria
const ratioConfigs: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  isPercentage: boolean;
  evaluate: (value: number) => 'good' | 'regular' | 'bad';
}> = {
  'Current Ratio': {
    title: 'Liquidez Corriente',
    subtitle: 'Capacidad para pagar deudas a corto plazo',
    description: 'Este ratio indica cuántas veces puede la cooperativa cubrir sus deudas corrientes con sus activos corrientes. Un valor entre 1.5 y 3 se considera saludable.',
    isPercentage: false,
    evaluate: (v) => v >= 1.5 ? 'good' : v >= 1 ? 'regular' : 'bad',
  },
  'Ratio Corriente': {
    title: 'Liquidez Corriente',
    subtitle: 'Capacidad para pagar deudas a corto plazo',
    description: 'Este ratio indica cuántas veces puede la cooperativa cubrir sus deudas corrientes con sus activos corrientes. Un valor entre 1.5 y 3 se considera saludable.',
    isPercentage: false,
    evaluate: (v) => v >= 1.5 ? 'good' : v >= 1 ? 'regular' : 'bad',
  },
  'Debt to Assets': {
    title: 'Endeudamiento',
    subtitle: 'Proporción de deudas sobre el total de activos',
    description: 'Muestra qué porcentaje de los activos está financiado con deuda. Un valor menor a 0.5 (50%) se considera prudente para una cooperativa.',
    isPercentage: true,
    evaluate: (v) => v < 0.2 ? 'good' : v < 0.5 ? 'regular' : 'bad',
  },
  'Deuda sobre Activos': {
    title: 'Endeudamiento',
    subtitle: 'Proporción de deudas sobre el total de activos',
    description: 'Muestra qué porcentaje de los activos está financiado con deuda. Un valor menor a 0.5 (50%) se considera prudente para una cooperativa.',
    isPercentage: true,
    evaluate: (v) => v < 0.2 ? 'good' : v < 0.5 ? 'regular' : 'bad',
  },
  'Return on Equity': {
    title: 'Rentabilidad del Patrimonio',
    subtitle: 'Rendimiento sobre el patrimonio de los socios',
    description: 'Indica qué tan eficientemente se está utilizando el capital de los socios para generar beneficios. Un valor entre 8% y 15% es considerado bueno.',
    isPercentage: true,
    evaluate: (v) => v >= 0.15 ? 'good' : v >= 0.08 ? 'regular' : 'bad',
  },
  'Rentabilidad del Patrimonio': {
    title: 'Rentabilidad del Patrimonio',
    subtitle: 'Rendimiento sobre el patrimonio de los socios',
    description: 'Indica qué tan eficientemente se está utilizando el capital de los socios para generar beneficios. Un valor entre 8% y 15% es considerado bueno.',
    isPercentage: true,
    evaluate: (v) => v >= 0.15 ? 'good' : v >= 0.08 ? 'regular' : 'bad',
  },
  'Operating Margin': {
    title: 'Margen Operacional',
    subtitle: 'Eficiencia operativa de la cooperativa',
    description: 'Muestra qué porcentaje de los ingresos se convierte en utilidad operacional. Un margen superior al 15% indica una buena gestión operativa.',
    isPercentage: true,
    evaluate: (v) => v >= 0.2 ? 'good' : v >= 0.1 ? 'regular' : 'bad',
  },
  'Margen Operativo': {
    title: 'Margen Operacional',
    subtitle: 'Eficiencia operativa de la cooperativa',
    description: 'Muestra qué porcentaje de los ingresos se convierte en utilidad operacional. Un margen superior al 15% indica una buena gestión operativa.',
    isPercentage: true,
    evaluate: (v) => v >= 0.2 ? 'good' : v >= 0.1 ? 'regular' : 'bad',
  },
};

export default function FinancialRatios() {
  const { formatPeriod, selectedPeriod } = usePeriod();
  const { selectedCooperative } = useCooperative();
  const navigate = useNavigate();

  const [ratios, setRatios] = useState<RatioData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  const handleExportPdf = async () => {
    if (!selectedPeriod) return;
    setIsExportingPdf(true);
    try {
      await exportToPdf('financial-ratios-content', {
        filename: `ratios-financieros-${selectedPeriod.year}-${selectedPeriod.month}`,
        title: 'Ratios Financieros',
        subtitle: `${selectedCooperative?.name || 'Cooperativa'}`,
      });
      toast.success('PDF exportado exitosamente');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Error al exportar el PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getConfig = (ratio: RatioData) => {
    return ratioConfigs[ratio.name] || {
      title: ratio.name,
      subtitle: ratio.description,
      description: ratio.description,
      isPercentage: ratio.name.toLowerCase().includes('margin') || ratio.name.toLowerCase().includes('return'),
      evaluate: () => 'regular' as const,
    };
  };

  const formatValue = (ratio: RatioData, config: typeof ratioConfigs[string]) => {
    if (config.isPercentage) {
      return `${(ratio.value * 100).toFixed(1)}%`;
    }
    return ratio.value.toFixed(2);
  };

  const getStatusInfo = (status: 'good' | 'regular' | 'bad') => {
    switch (status) {
      case 'good':
        return {
          label: 'Bueno',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: CheckCircle,
        };
      case 'regular':
        return {
          label: 'Regular',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: AlertCircle,
        };
      case 'bad':
        return {
          label: 'Necesita atención',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: AlertCircle,
        };
    }
  };

  // Calculate summary stats
  const goodCount = ratios.filter(r => {
    const config = getConfig(r);
    return config.evaluate(r.value) === 'good';
  }).length;

  const regularCount = ratios.filter(r => {
    const config = getConfig(r);
    return config.evaluate(r.value) === 'regular';
  }).length;

  const badCount = ratios.filter(r => {
    const config = getConfig(r);
    return config.evaluate(r.value) === 'bad';
  }).length;

  if (isLoading) {
    return (
      <AppLayout title="Ratios Financieros" subtitle="Indicadores clave de la salud financiera">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Ratios Financieros" subtitle="Indicadores clave de la salud financiera">
      <div id="financial-ratios-content" className="space-y-4 md:space-y-6">
        {/* Header with back and export buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">¿Dudas?</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting || ratios.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              disabled={isExportingPdf || ratios.length === 0}
            >
              {isExportingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>

        {ratios.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay datos de ratios disponibles para este período
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Ratio Cards Grid - 2x2 */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 animate-stagger">
              {ratios.slice(0, 4).map((ratio) => {
                const config = getConfig(ratio);
                const status = config.evaluate(ratio.value);
                const statusInfo = getStatusInfo(status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={ratio.id}
                    className={cn(
                      'overflow-hidden transition-all duration-200',
                      statusInfo.borderColor,
                      'border-l-4'
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base md:text-lg font-semibold">
                          {config.title}
                        </CardTitle>
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          statusInfo.bgColor,
                          statusInfo.color
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className={cn(
                          'text-3xl md:text-4xl font-bold',
                          statusInfo.color
                        )}>
                          {formatValue(ratio, config)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.subtitle}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {config.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Executive Summary */}
            <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base md:text-lg">Resumen Ejecutivo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                      {goodCount}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Ratios en buen estado
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <p className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {regularCount}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Ratio regular
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                      {badCount}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Ratio que necesita atención
                    </p>
                  </div>
                </div>

                {/* General Recommendation */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Recomendación General
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    {goodCount >= ratios.length * 0.7
                      ? 'La cooperativa muestra una situación financiera mayormente saludable. Se recomienda prestar atención al ratio de endeudamiento y continuar monitoreando todos los indicadores mensualmente para mantener la estabilidad financiera.'
                      : 'La cooperativa presenta indicadores que requieren atención. Se recomienda revisar los ratios en estado regular o crítico y tomar acciones correctivas para mejorar la salud financiera de la organización.'
                    }
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
