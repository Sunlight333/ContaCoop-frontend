import { AppLayout } from '@/components/layout/AppLayout';
import { usePeriod } from '@/contexts/PeriodContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ChevronDown, ChevronRight, Loader2, FileText } from 'lucide-react';
import { exportToPdf } from '@/lib/pdf-export';
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

// Map subcategories to Odoo-like display names
const subcategoryLabels: Record<string, string> = {
  'current_assets': 'Activos corrientes',
  'cash': 'Cuentas bancarias y de efectivo',
  'receivable': 'Por cobrar',
  'current': 'Activos corrientes',
  'prepayments': 'Prepagos',
  'fixed_assets': 'Activos adicionales fijos',
  'non_current_assets': 'Activos adicionales no circulantes',
  'current_liabilities': 'Pasivos corrientes',
  'payable': 'Por pagar',
  'non_current_liabilities': 'Pasivos adicionales no circulantes',
  'retained_earnings': 'Ganancias sin asignar',
  'capital': 'Capital',
};

function getSubcategoryLabel(sub?: string): string {
  if (!sub) return '';
  return subcategoryLabels[sub] || sub;
}

// Group entries by subcategory within a category
function groupBySubcategory(entries: BalanceEntry[]): Record<string, BalanceEntry[]> {
  const groups: Record<string, BalanceEntry[]> = {};
  entries.forEach(entry => {
    const key = entry.subcategory || 'other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
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
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  const [balanceData, setBalanceData] = useState<BalanceEntry[]>([]);
  const [summary, setSummary] = useState({ totalAssets: 0, totalLiabilities: 0, totalEquity: 0, isBalanced: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  const handleExportPdf = async () => {
    if (!selectedPeriod) return;
    setIsExportingPdf(true);
    try {
      await exportToPdf('balance-sheet-content', {
        filename: `balance-general-${selectedPeriod.year}-${selectedPeriod.month}`,
        title: 'Balance General',
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

  // Group entries by category
  const assetEntries = balanceData.filter(e => e.category === 'assets');
  const liabilityEntries = balanceData.filter(e => e.category === 'liabilities');
  const equityEntries = balanceData.filter(e => e.category === 'equity');

  const { totalAssets, totalLiabilities, totalEquity } = summary;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSubcategory = (key: string) => {
    setExpandedSubcategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getEntryBalance = (entry: BalanceEntry) => {
    return entry.finalDebit - entry.finalCredit;
  };

  // Odoo-style collapsible section
  const OdooSection = ({
    title,
    entries,
    total,
    sectionKey,
  }: {
    title: string;
    entries: BalanceEntry[];
    total: number;
    sectionKey: string;
  }) => {
    const isExpanded = expandedSections[sectionKey];
    const subcategoryGroups = groupBySubcategory(entries);

    return (
      <div className="mb-2">
        {/* Main category header */}
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between py-2.5 px-3 sm:px-4 bg-muted/60 hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="font-heading font-bold text-sm sm:text-base text-foreground uppercase">{title}</span>
          </div>
        </button>

        {isExpanded && (
          <div>
            {Object.entries(subcategoryGroups).map(([subKey, subEntries]) => {
              const subTotal = subEntries.reduce((sum, e) => sum + getEntryBalance(e), 0);
              const fullKey = `${sectionKey}-${subKey}`;
              const isSubExpanded = expandedSubcategories[fullKey] !== false; // default open

              return (
                <div key={subKey}>
                  {/* Subcategory header */}
                  <button
                    onClick={() => toggleSubcategory(fullKey)}
                    className="w-full flex items-center justify-between py-2 px-3 pl-6 sm:px-4 sm:pl-8 hover:bg-muted/30 transition-colors border-b border-border/50"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isSubExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                        {getSubcategoryLabel(subKey)}
                      </span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm text-foreground flex-shrink-0 ml-2">
                      {formatCurrency(Math.abs(subTotal))}
                    </span>
                  </button>

                  {/* Individual entries */}
                  {isSubExpanded && subEntries.map(entry => {
                    const balance = getEntryBalance(entry);
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between py-2 px-3 pl-10 sm:px-4 sm:pl-16 border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <span className="text-xs sm:text-sm text-foreground truncate min-w-0 flex-1">{entry.accountName}</span>
                        <span className="font-mono text-xs sm:text-sm text-foreground flex-shrink-0 ml-2">
                          {formatCurrency(Math.abs(balance))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Category total */}
            <div className="flex items-center justify-between py-2.5 px-3 sm:px-4 bg-muted/40 border-y border-border font-bold">
              <span className="text-xs sm:text-sm text-foreground pl-2 sm:pl-4">Total {title}</span>
              <span className="font-mono text-xs sm:text-sm text-foreground">{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout title="Balance General" subtitle={`Balance para ${formatPeriod()}`}>
      <div id="balance-sheet-content" className="space-y-4 md:space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end gap-2 animate-slide-up">
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

        {/* Odoo-style Balance Sheet */}
        <Card className="animate-slide-up overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="text-right py-3 px-3 sm:px-4 border-b bg-muted/30">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">{formatPeriod()}</span>
                  <br />
                  <span className="text-xs sm:text-sm font-bold text-foreground">Balance</span>
                </div>

                {/* ACTIVOS */}
                <OdooSection
                  title="ACTIVOS"
                  entries={assetEntries}
                  total={totalAssets}
                  sectionKey="assets"
                />

                {/* PASIVOS */}
                <OdooSection
                  title="PASIVOS"
                  entries={liabilityEntries}
                  total={totalLiabilities}
                  sectionKey="liabilities"
                />

                {/* CAPITAL */}
                <OdooSection
                  title="CAPITAL"
                  entries={equityEntries}
                  total={totalEquity}
                  sectionKey="equity"
                />

                {/* Grand Total */}
                <div className="flex items-center justify-between py-3 px-3 sm:px-4 bg-foreground/5 border-t-2 border-foreground/20 font-bold">
                  <span className="text-xs sm:text-sm text-foreground">Total PASIVOS + CAPITAL</span>
                  <span className="font-mono text-xs sm:text-sm text-foreground">
                    {formatCurrency(totalLiabilities + totalEquity)}
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
