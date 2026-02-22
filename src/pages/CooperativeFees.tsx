import { AppLayout } from '@/components/layout/AppLayout';
import { usePeriod } from '@/contexts/PeriodContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, AlertTriangle, XCircle, ArrowLeft, Info, FileText } from 'lucide-react';
import { exportToPdf } from '@/lib/pdf-export';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { financialApi, downloadBlob } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MemberFee {
  id: string;
  memberId: string;
  memberName: string;
  expectedContribution: number;
  paymentMade: number;
  pending: number;
  status: 'up_to_date' | 'pending' | 'overdue' | 'up-to-date' | 'with-debt' | 'with_debt';
}

interface FeeSummary {
  totalExpected: number;
  totalPaid: number;
  totalDebt: number;
  complianceRate: number;
  membersWithDebt: number;
  totalMembers: number;
}

export default function CooperativeFees() {
  const { formatPeriod, selectedPeriod } = usePeriod();
  const { selectedCooperative } = useCooperative();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [fees, setFees] = useState<MemberFee[]>([]);
  const [summary, setSummary] = useState<FeeSummary>({
    totalExpected: 0,
    totalPaid: 0,
    totalDebt: 0,
    complianceRate: 0,
    membersWithDebt: 0,
    totalMembers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPeriod) return;
      setIsLoading(true);
      try {
        const data = await financialApi.getMembershipFees(
          selectedPeriod.year,
          selectedPeriod.month,
          undefined,
          undefined,
          selectedCooperative?.id
        );
        if (data) {
          // Transform the data to match our interface
          const transformedFees: MemberFee[] = (data.fees || []).map((fee: any) => ({
            id: fee.id,
            memberId: fee.memberId,
            memberName: fee.memberName,
            expectedContribution: fee.expectedContribution || 0,
            paymentMade: fee.paymentMade || 0,
            pending: fee.debt || (fee.expectedContribution - fee.paymentMade) || 0,
            status: fee.status,
          }));
          setFees(transformedFees);

          // Calculate summary
          const totalExpected = transformedFees.reduce((sum, f) => sum + f.expectedContribution, 0);
          const totalPaid = transformedFees.reduce((sum, f) => sum + f.paymentMade, 0);
          const totalDebt = transformedFees.reduce((sum, f) => sum + f.pending, 0);
          const membersWithDebt = transformedFees.filter(f => f.pending > 0).length;
          const complianceRate = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;

          setSummary({
            totalExpected,
            totalPaid,
            totalDebt,
            complianceRate,
            membersWithDebt,
            totalMembers: transformedFees.length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch cooperative fees:', error);
        toast.error('Error al cargar las cuotas de la cooperativa');
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
      const blob = await financialApi.exportMembershipFees(
        selectedPeriod.year,
        selectedPeriod.month,
        selectedCooperative?.id
      );
      downloadBlob(blob, `cuotas-cooperativa-${selectedPeriod.year}-${selectedPeriod.month}.xlsx`);
      toast.success('Cuotas exportadas exitosamente');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Error al exportar las cuotas');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedPeriod) return;
    setIsExportingPdf(true);
    try {
      await exportToPdf('cooperative-fees-content', {
        filename: `cuotas-cooperativa-${selectedPeriod.year}-${selectedPeriod.month}`,
        title: 'Cuotas Sociales',
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusInfo = (fee: MemberFee) => {
    const status = fee.status?.replace('-', '_') || 'pending';
    const pendingRatio = fee.expectedContribution > 0 ? fee.pending / fee.expectedContribution : 0;

    if (fee.pending <= 0 || status === 'up_to_date') {
      return {
        label: 'Al día',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: CheckCircle,
      };
    } else if (pendingRatio < 0.5 || status === 'with_debt') {
      return {
        label: 'Pendiente',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: AlertTriangle,
      };
    } else {
      return {
        label: 'Moroso',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: XCircle,
      };
    }
  };

  return (
    <AppLayout title="Cuotas Sociales" subtitle="Aportes y estado de cumplimiento de los socios">
      <div id="cooperative-fees-content" className="space-y-4 md:space-y-6">
        {/* Header with back button and export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex gap-2">
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

        {/* Summary Cards */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 animate-stagger">
          <Card className="bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <CardContent className="pt-6">
              <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">Capital Social Total</p>
              <p className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mt-2">
                {formatCurrency(summary.totalExpected)}
              </p>
              <p className="text-sm text-teal-600/70 dark:text-teal-400/70 mt-1">
                Comprometido por todos los socios
              </p>
            </CardContent>
          </Card>
          <Card className="bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <CardContent className="pt-6">
              <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">% de Cumplimiento</p>
              <p className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mt-2">
                {summary.complianceRate.toFixed(1)}%
              </p>
              <p className="text-sm text-teal-600/70 dark:text-teal-400/70 mt-1">
                {formatCurrency(summary.totalPaid)} de {formatCurrency(summary.totalExpected)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Estado de Aportes por Socio</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay datos de cuotas disponibles para este período
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="text-left py-3 px-2 font-medium">Nombre del Socio</th>
                      <th className="text-right py-3 px-2 font-medium">Aporte Comprometido</th>
                      <th className="text-right py-3 px-2 font-medium">Pagado</th>
                      <th className="text-right py-3 px-2 font-medium">Pendiente</th>
                      <th className="text-center py-3 px-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => {
                      const statusInfo = getStatusInfo(fee);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <tr key={fee.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-2 font-medium">{fee.memberName}</td>
                          <td className="py-3 px-2 text-right font-mono">
                            {formatCurrency(fee.expectedContribution)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-green-600 dark:text-green-400">
                            {formatCurrency(fee.paymentMade)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-yellow-600 dark:text-yellow-400">
                            {fee.pending > 0 ? formatCurrency(fee.pending) : '$0'}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-center">
                              <span className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                statusInfo.bgColor,
                                statusInfo.color
                              )}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {statusInfo.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Explanatory Section */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 animate-slide-up">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-base md:text-lg text-blue-900 dark:text-blue-100">
                ¿Qué son las cuotas sociales?
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              Las cuotas sociales representan el capital que cada socio se compromete a aportar a la cooperativa.
              Este capital es fundamental para el funcionamiento y crecimiento de la organización.
              El estado de cada socio se clasifica como: <strong className="text-green-600 dark:text-green-400">Al día</strong> (ha pagado todo),
              <strong className="text-yellow-600 dark:text-yellow-400"> Pendiente</strong> (tiene pagos menores pendientes) o
              <strong className="text-red-600 dark:text-red-400"> Moroso</strong> (tiene pagos significativos sin realizar).
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
