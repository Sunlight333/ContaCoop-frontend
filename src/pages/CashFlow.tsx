import { AppLayout } from '@/components/layout/AppLayout';
import { usePeriod } from '@/contexts/PeriodContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { exportToPdf } from '@/lib/pdf-export';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { financialApi, downloadBlob } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';
import { toast } from 'sonner';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [historyData, setHistoryData] = useState<{ period: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPeriod) return;
      setIsLoading(true);
      try {
        const cashFlowResult = await financialApi.getCashFlow(
          selectedPeriod.year,
          selectedPeriod.month,
          selectedCooperative?.id
        );

        if (cashFlowResult) {
          setCashFlowData(cashFlowResult.entries || []);
          setSummary(cashFlowResult.summary || { operating: 0, investing: 0, financing: 0, netCashFlow: 0 });
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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await financialApi.getCashFlowHistory(6, selectedCooperative?.id);
        if (history && Array.isArray(history)) {
          setHistoryData(history.map((h: any) => ({
            period: h.period || `${h.month}/${h.year}`,
            value: h.netCashFlow ?? h.value ?? 0,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch cash flow history:', error);
      }
    };
    fetchHistory();
  }, [selectedCooperative]);

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

  const handleExportPdf = async () => {
    if (!selectedPeriod) return;
    setIsExportingPdf(true);
    try {
      await exportToPdf('cash-flow-content', {
        filename: `flujo-caja-${selectedPeriod.year}-${selectedPeriod.month}`,
        title: 'Estado de Flujo de Caja',
        subtitle: `${formatPeriod()} - ${selectedCooperative?.name || 'Cooperativa'}`,
      });
      toast.success('PDF exportado exitosamente');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Error al exportar el PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatUSD = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toLocaleString('en-US')} US$`;
  };

  // Group entries by category
  const operatingEntries = cashFlowData.filter(e => e.category === 'operating');
  const investingEntries = cashFlowData.filter(e => e.category === 'investing');
  const financingEntries = cashFlowData.filter(e => e.category === 'financing');

  const { operating: operatingTotal, investing: investingTotal, financing: financingTotal, netCashFlow } = summary;

  // Odoo-style row
  const EntryRow = ({ label, value, indent = false, bold = false, highlight = false }: {
    label: string;
    value: number;
    indent?: boolean;
    bold?: boolean;
    highlight?: boolean;
  }) => (
    <div className={cn(
      'flex items-center justify-between py-2.5 px-4 border-b border-border/30',
      indent && 'pl-10',
      bold && 'font-bold',
      highlight && 'bg-primary/5',
    )}>
      <span className={cn('text-sm text-foreground', bold && 'font-bold')}>
        {label}
      </span>
      <span className={cn('font-mono text-sm text-foreground', bold && 'font-bold')}>
        {formatCurrency(value)}
      </span>
    </div>
  );

  // Section header (like Odoo)
  const SectionHeader = ({ label }: { label: string }) => (
    <div className="py-2.5 px-4 bg-muted/50 border-b border-border">
      <span className="text-sm font-bold text-foreground">{label}</span>
    </div>
  );

  return (
    <AppLayout title="Estado de Flujo de Caja" subtitle={`Análisis de flujo de caja para ${formatPeriod()}`}>
      <div id="cash-flow-content" className="space-y-4 md:space-y-6">
        {/* Net Cash Flow Badge + Export buttons */}
        <div className="flex items-center justify-between animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Flujo de Caja Neto</p>
              <p className="text-sm font-bold text-primary">{formatUSD(netCashFlow)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting || isLoading}
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
              disabled={isExportingPdf || isLoading}
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

        {/* Flow Summary Bar: Operación → Inversión → Financiamiento → Flujo Neto */}
        <Card className="animate-slide-up">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Operación</p>
                <p className="text-sm md:text-base font-bold text-primary">{formatUSD(operatingTotal)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Inversión</p>
                <p className="text-sm md:text-base font-bold text-primary">{formatUSD(investingTotal)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Financiamiento</p>
                <p className="text-sm md:text-base font-bold text-primary">{formatUSD(financingTotal)}</p>
              </div>
              <div className="w-px h-8 bg-border mx-2 hidden sm:block" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Flujo de Caja Neto</p>
                <p className="text-base md:text-lg font-bold text-primary">{formatUSD(netCashFlow)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tendencia del Flujo de Caja - Full width trend chart */}
        <Card className="animate-slide-up">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base md:text-lg">Tendencia del Flujo de Caja</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`$${formatCurrency(value)}`, 'Flujo Neto']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Flujo Neto"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Subtotal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 animate-slide-up">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-sm font-medium text-foreground">Actividades de Operación</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-bold text-primary">{formatUSD(operatingTotal)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-foreground">Actividades de Inversión</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-bold text-primary">{formatUSD(investingTotal)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-foreground">Actividades de Financiamiento</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-bold text-primary">{formatUSD(financingTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Odoo-style Cash Flow Statement */}
        <Card className="animate-slide-up overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div>
                {/* Period header */}
                <div className="text-right py-3 px-4 border-b bg-muted/30">
                  <span className="text-sm font-medium text-muted-foreground">{formatPeriod()}</span>
                  <br />
                  <span className="text-sm font-bold text-foreground">Balance</span>
                </div>

                {/* Opening Balance */}
                <EntryRow
                  label="Efectivo y equivalentes de efectivo, inicio de periodo"
                  value={0}
                  highlight
                  bold
                />

                {/* Incremento neto */}
                <SectionHeader label="Incremento neto de efectivo y de equivalentes de efectivo" />

                {/* Flujos de efectivo de actividades operativas */}
                <SectionHeader label="Flujos de efectivo de actividades operativas" />
                {operatingEntries.map(entry => (
                  <EntryRow key={entry.id} label={entry.description} value={entry.amount} indent />
                ))}
                {operatingEntries.length === 0 && (
                  <>
                    <EntryRow label="Anticipos recibidos de los clientes" value={0} indent />
                    <EntryRow label="Efectivo recibido por actividades operativas" value={0} indent />
                    <EntryRow label="Anticipos pagados a proveedores" value={0} indent />
                    <EntryRow label="Efectivo pagado por actividades operativas" value={0} indent />
                  </>
                )}
                <EntryRow label="Efectivo pagado por actividades operativas" value={operatingTotal} bold />

                {/* Flujos de efectivo de actividades de inversión */}
                <SectionHeader label="Flujos de efectivo de actividades de inversión y extraordinarias" />
                {investingEntries.map(entry => (
                  <EntryRow key={entry.id} label={entry.description} value={entry.amount} indent />
                ))}
                {investingEntries.length === 0 && (
                  <>
                    <EntryRow label="Entrada de efectivo" value={0} indent />
                    <EntryRow label="Salida de efectivo" value={0} indent />
                  </>
                )}

                {/* Flujos de efectivo de actividades financieras */}
                <SectionHeader label="Flujos de efectivo de actividades financieras" />
                {financingEntries.map(entry => (
                  <EntryRow key={entry.id} label={entry.description} value={entry.amount} indent />
                ))}
                {financingEntries.length === 0 && (
                  <>
                    <EntryRow label="Entrada de efectivo" value={0} indent />
                    <EntryRow label="Salida de efectivo" value={0} indent />
                  </>
                )}

                {/* Flujos sin clasificar */}
                <SectionHeader label="Flujos de efectivo de actividades sin clasificar" />
                <EntryRow label="Entrada de efectivo" value={0} indent />
                <EntryRow label="Salida de efectivo" value={0} indent />

                {/* Closing Balance */}
                <div className="flex items-center justify-between py-3 px-4 bg-primary/10 border-t-2 border-primary/30 font-bold">
                  <span className="text-sm text-primary font-bold">
                    Efectivo y equivalentes de efectivo, balance de cierre
                  </span>
                  <span className="font-mono text-sm text-primary font-bold">
                    {formatCurrency(netCashFlow)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
