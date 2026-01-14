import { AppLayout } from '@/components/layout/AppLayout';
import { usePeriod } from '@/contexts/PeriodContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { financialApi, downloadBlob } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';
import { toast } from 'sonner';

interface BalanceEntry {
  id: string;
  accountCode: string;
  accountName: string;
  category: 'assets' | 'liabilities' | 'equity';
  subcategory?: string;
  initialDebit: number;
  initialCredit: number;
  periodDebit: number;
  periodCredit: number;
  finalDebit: number;
  finalCredit: number;
}

export default function BalanceSheet() {
  const { formatPeriod, selectedPeriod } = usePeriod();
  const { selectedCooperative } = useCooperative();
  const isMobile = useIsMobile();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    assets: true,
    liabilities: true,
    equity: true,
  });
  const [balanceData, setBalanceData] = useState<BalanceEntry[]>([]);
  const [summary, setSummary] = useState({ totalAssets: 0, totalLiabilities: 0, totalEquity: 0, isBalanced: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPeriod) return;
      setIsLoading(true);
      try {
        const data = await financialApi.getBalanceSheet(
          selectedPeriod.year,
          selectedPeriod.month,
          selectedCooperative?.id
        );
        if (data) {
          setBalanceData(data.entries || []);
          setSummary(data.summary || { totalAssets: 0, totalLiabilities: 0, totalEquity: 0, isBalanced: true });
        }
      } catch (error) {
        console.error('Failed to fetch balance sheet:', error);
        toast.error('Error al cargar el balance general');
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
      const blob = await financialApi.exportBalanceSheet(
        selectedPeriod.year,
        selectedPeriod.month,
        selectedCooperative?.id
      );
      downloadBlob(blob, `balance-general-${selectedPeriod.year}-${selectedPeriod.month}.xlsx`);
      toast.success('Balance exportado exitosamente');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Error al exportar el balance');
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
  const assetEntries = balanceData.filter(e => e.category === 'assets');
  const liabilityEntries = balanceData.filter(e => e.category === 'liabilities');
  const equityEntries = balanceData.filter(e => e.category === 'equity');

  // Use summary from API
  const { totalAssets, totalLiabilities, totalEquity, isBalanced } = summary;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Mobile card view for each entry
  const MobileEntryCard = ({ entry }: { entry: BalanceEntry }) => {
    const finalValue = entry.finalDebit > 0 ? entry.finalDebit : entry.finalCredit;
    return (
      <div className="py-3 border-b border-border last:border-0">
        <div className="flex justify-between items-start gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{entry.accountName}</span>
          <span className="font-mono text-sm font-semibold text-foreground whitespace-nowrap">
            {formatCurrencyCompact(finalValue)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{entry.accountCode}</span>
          <span>{entry.subcategory}</span>
        </div>
      </div>
    );
  };

  // Mobile section with collapsible entries
  const MobileSection = ({
    title,
    entries,
    total,
    sectionKey,
    colorClass,
  }: {
    title: string;
    entries: BalanceEntry[];
    total: number;
    sectionKey: string;
    colorClass: string;
  }) => {
    const isExpanded = expandedSections[sectionKey];
    return (
      <Card className="overflow-hidden hover-lift animated-border transition-smooth">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={cn(
            'w-full flex items-center justify-between p-4',
            colorClass
          )}
        >
          <span className="font-heading font-semibold">{title}</span>
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold">{formatCurrencyCompact(total)}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
        {isExpanded && (
          <CardContent className="pt-0 px-4 pb-4">
            {entries.map(entry => (
              <MobileEntryCard key={entry.id} entry={entry} />
            ))}
          </CardContent>
        )}
      </Card>
    );
  };

  const TableHeader = () => (
    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
      <tr className="text-xs font-semibold text-foreground uppercase tracking-wide">
        <th className="text-left py-3 px-4 border-b">Código</th>
        <th className="text-left py-3 px-4 border-b">Nombre de Cuenta</th>
        <th className="text-right py-3 px-4 border-b">Inicial (Db)</th>
        <th className="text-right py-3 px-4 border-b">Inicial (Cr)</th>
        <th className="text-right py-3 px-4 border-b">Período (Db)</th>
        <th className="text-right py-3 px-4 border-b">Período (Cr)</th>
        <th className="text-right py-3 px-4 border-b">Final (Db)</th>
        <th className="text-right py-3 px-4 border-b">Final (Cr)</th>
      </tr>
    </thead>
  );

  const renderEntryRow = (entry: BalanceEntry) => (
    <tr key={entry.id} className="hover:bg-muted/30 transition-colors text-sm">
      <td className="py-2.5 px-4 font-mono text-muted-foreground">{entry.accountCode}</td>
      <td className="py-2.5 px-4">{entry.accountName}</td>
      <td className="py-2.5 px-4 text-right font-mono">{entry.initialDebit > 0 ? formatCurrency(entry.initialDebit) : '—'}</td>
      <td className="py-2.5 px-4 text-right font-mono">{entry.initialCredit > 0 ? formatCurrency(entry.initialCredit) : '—'}</td>
      <td className="py-2.5 px-4 text-right font-mono">{entry.periodDebit > 0 ? formatCurrency(entry.periodDebit) : '—'}</td>
      <td className="py-2.5 px-4 text-right font-mono">{entry.periodCredit > 0 ? formatCurrency(entry.periodCredit) : '—'}</td>
      <td className="py-2.5 px-4 text-right font-mono font-medium">{entry.finalDebit > 0 ? formatCurrency(entry.finalDebit) : '—'}</td>
      <td className="py-2.5 px-4 text-right font-mono font-medium">{entry.finalCredit > 0 ? formatCurrency(entry.finalCredit) : '—'}</td>
    </tr>
  );

  const renderSubtotal = (label: string, debit: number, credit: number) => (
    <tr className="bg-muted/50 font-medium text-sm">
      <td colSpan={6} className="py-2.5 px-4 text-right">{label}</td>
      <td className="py-2.5 px-4 text-right font-mono">{debit > 0 ? formatCurrency(debit) : '—'}</td>
      <td className="py-2.5 px-4 text-right font-mono">{credit > 0 ? formatCurrency(credit) : '—'}</td>
    </tr>
  );

  return (
    <AppLayout title="Balance General" subtitle={`Balance de comprobación de 8 columnas para ${formatPeriod()}`}>
      <div className="space-y-4 md:space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1.5 rounded-lg animate-pulse-subtle">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Cuadrado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Descuadrado</span>
              </div>
            )}
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

        {/* Summary Cards - Moved to Top */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3 animate-stagger">
          <Card className="bg-primary/5 border-primary/20 hover-lift animated-border transition-smooth">
            <CardContent className="pt-4 md:pt-5 px-4 md:px-6">
              <p className="text-xs md:text-sm text-muted-foreground">Total Activos</p>
              <p className="font-heading text-xl md:text-2xl font-bold text-foreground mt-1">
                {isMobile ? formatCurrencyCompact(totalAssets) : formatCurrency(totalAssets)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-chart-2/5 border-chart-2/20 hover-lift animated-border transition-smooth">
            <CardContent className="pt-4 md:pt-5 px-4 md:px-6">
              <p className="text-xs md:text-sm text-muted-foreground">Total Pasivos</p>
              <p className="font-heading text-xl md:text-2xl font-bold text-foreground mt-1">
                {isMobile ? formatCurrencyCompact(totalLiabilities) : formatCurrency(totalLiabilities)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-chart-4/5 border-chart-4/20 hover-lift animated-border transition-smooth">
            <CardContent className="pt-4 md:pt-5 px-4 md:px-6">
              <p className="text-xs md:text-sm text-muted-foreground">Total Patrimonio</p>
              <p className="font-heading text-xl md:text-2xl font-bold text-foreground mt-1">
                {isMobile ? formatCurrencyCompact(totalEquity) : formatCurrency(totalEquity)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile View: Collapsible Cards */}
        {isMobile && (
          <div className="space-y-3 animate-stagger">
            <MobileSection
              title="ACTIVOS"
              entries={assetEntries}
              total={totalAssets}
              sectionKey="assets"
              colorClass="bg-primary/5 text-primary"
            />
            <MobileSection
              title="PASIVOS"
              entries={liabilityEntries}
              total={totalLiabilities}
              sectionKey="liabilities"
              colorClass="bg-chart-2/10 text-chart-2"
            />
            <MobileSection
              title="PATRIMONIO"
              entries={equityEntries}
              total={totalEquity}
              sectionKey="equity"
              colorClass="bg-chart-4/10 text-chart-4"
            />

            {/* Mobile Grand Total */}
            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">Pasivo + Patrimonio</span>
                  <span className="font-heading text-lg font-bold text-foreground">
                    {formatCurrencyCompact(totalLiabilities + totalEquity)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Desktop View: Full Table */}
        {!isMobile && (
          <Card className="animate-slide-up animated-border" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[900px]">
                  <TableHeader />
                  <tbody>
                    {/* Assets Section */}
                    <tr className="bg-primary/5">
                      <td colSpan={8} className="py-2 px-4 font-heading font-semibold text-primary">
                        ACTIVOS
                      </td>
                    </tr>
                    {assetEntries.map(renderEntryRow)}
                    {renderSubtotal('Total Activos', totalAssets, 0)}

                    {/* Liabilities Section */}
                    <tr className="bg-chart-2/5">
                      <td colSpan={8} className="py-2 px-4 font-heading font-semibold text-chart-2">
                        PASIVOS
                      </td>
                    </tr>
                    {liabilityEntries.map(renderEntryRow)}
                    {renderSubtotal('Total Pasivos', 0, totalLiabilities)}

                    {/* Equity Section */}
                    <tr className="bg-chart-4/5">
                      <td colSpan={8} className="py-2 px-4 font-heading font-semibold text-chart-4">
                        PATRIMONIO
                      </td>
                    </tr>
                    {equityEntries.map(renderEntryRow)}
                    {renderSubtotal('Total Patrimonio', 0, totalEquity)}

                    {/* Grand Totals */}
                    <tr className="bg-foreground/5 font-bold text-sm border-t-2 border-foreground/20">
                      <td colSpan={6} className="py-3 px-4 text-right">Total Pasivo + Patrimonio</td>
                      <td className="py-3 px-4 text-right font-mono">—</td>
                      <td className="py-3 px-4 text-right font-mono">{formatCurrency(totalLiabilities + totalEquity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Educational Info Card - Comprehend the Balance Sheet */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 animate-slide-up">
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-base md:text-lg font-heading text-blue-900 dark:text-blue-100">
                Comprende tu Balance General
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">1</span>
                  Activos
                </h4>
                <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                  Son los bienes y derechos que posee la cooperativa: dinero en caja, cuentas por cobrar, inventarios, equipos, etc.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-2/20 text-xs text-chart-2">2</span>
                  Pasivos
                </h4>
                <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                  Son las obligaciones y deudas de la cooperativa: proveedores, préstamos bancarios, impuestos por pagar, etc.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-4/20 text-xs text-chart-4">3</span>
                  Patrimonio
                </h4>
                <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                  Es el capital aportado por los socios y las ganancias acumuladas. Representa la parte de los activos que realmente pertenece a la cooperativa.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">
                <strong>Ecuación fundamental:</strong> Activos = Pasivos + Patrimonio. Esta ecuación siempre debe estar balanceada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
