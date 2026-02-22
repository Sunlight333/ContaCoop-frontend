import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePeriod } from '@/contexts/PeriodContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Download, Search, Filter, Users, AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react';
import { exportToPdf } from '@/lib/pdf-export';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { financialApi, downloadBlob } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';
import { toast } from 'sonner';

interface MembershipFee {
  id: string;
  memberId: string;
  memberName: string;
  period: string;
  expectedContribution: number;
  paymentMade: number;
  debt: number;
  status: 'up_to_date' | 'with_debt' | 'up-to-date' | 'with-debt';
}

interface FeeSummary {
  totalExpected: number;
  totalPaid: number;
  totalDebt: number;
  membersWithDebt: number;
  totalMembers: number;
  collectionRate: number;
}

export default function MembershipFees() {
  const { formatPeriod, selectedPeriod } = usePeriod();
  const { selectedCooperative } = useCooperative();
  const { isAdmin, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const isMobile = useIsMobile();
  const [feesData, setFeesData] = useState<MembershipFee[]>([]);
  const [myFees, setMyFees] = useState<MembershipFee[]>([]);
  const [summary, setSummary] = useState<FeeSummary>({
    totalExpected: 0, totalPaid: 0, totalDebt: 0, membersWithDebt: 0, totalMembers: 0, collectionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPeriod) return;
      setIsLoading(true);
      try {
        if (isAdmin) {
          // Admin view: get all fees
          const data = await financialApi.getMembershipFees(
            selectedPeriod.year,
            selectedPeriod.month,
            searchTerm || undefined,
            statusFilter !== 'all' ? statusFilter : undefined,
            selectedCooperative?.id
          );
          if (data) {
            setFeesData(data.fees || []);
            setSummary(data.summary || { totalExpected: 0, totalPaid: 0, totalDebt: 0, membersWithDebt: 0, totalMembers: 0, collectionRate: 0 });
          }
        } else {
          // Socio view: get only my fees
          const data = await financialApi.getMyMembershipFees(selectedCooperative?.id);
          setMyFees(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch membership fees:', error);
        toast.error('Error al cargar las cuotas de socios');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod, selectedCooperative, searchTerm, statusFilter, isAdmin]);

  const handleExport = async () => {
    if (!selectedPeriod) return;
    setIsExporting(true);
    try {
      const blob = await financialApi.exportMembershipFees(
        selectedPeriod.year,
        selectedPeriod.month,
        selectedCooperative?.id
      );
      downloadBlob(blob, `cuotas-socios-${selectedPeriod.year}-${selectedPeriod.month}.xlsx`);
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
      await exportToPdf('membership-fees-content', {
        filename: `cuotas-socios-${selectedPeriod.year}-${selectedPeriod.month}`,
        title: 'Cuotas de Socios',
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  };

  // Data from API - filtering is done server-side
  const filteredData = feesData;

  // Helper to check if status is up to date (handles both formats)
  const isUpToDate = (status: string) => status === 'up_to_date' || status === 'up-to-date';

  const columns = [
    {
      key: 'memberId',
      header: 'ID Socio',
      cell: (item: MembershipFee) => (
        <span className="font-mono text-muted-foreground">{item.memberId}</span>
      ),
    },
    {
      key: 'memberName',
      header: 'Nombre del Socio',
      cell: (item: MembershipFee) => (
        <span className="font-medium">{item.memberName}</span>
      ),
    },
    {
      key: 'period',
      header: 'Período',
    },
    {
      key: 'expectedContribution',
      header: 'Esperado',
      align: 'right' as const,
      cell: (item: MembershipFee) => (
        <span className="font-mono">{formatCurrency(item.expectedContribution)}</span>
      ),
    },
    {
      key: 'paymentMade',
      header: 'Pagado',
      align: 'right' as const,
      cell: (item: MembershipFee) => (
        <span className={cn(
          'font-mono',
          item.paymentMade >= item.expectedContribution ? 'text-success' : 'text-foreground'
        )}>
          {formatCurrency(item.paymentMade)}
        </span>
      ),
    },
    {
      key: 'debt',
      header: 'Pendiente',
      align: 'right' as const,
      cell: (item: MembershipFee) => (
        <span className={cn(
          'font-mono font-medium',
          item.debt > 0 ? 'text-destructive' : 'text-success'
        )}>
          {item.debt > 0 ? formatCurrency(item.debt) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center' as const,
      cell: (item: MembershipFee) => (
        <StatusBadge
          status={isUpToDate(item.status) ? 'success' : 'warning'}
          label={isUpToDate(item.status) ? 'Al Día' : 'Con Deuda'}
        />
      ),
    },
  ];

  // Mobile card for each member
  const MobileMemberCard = ({ fee }: { fee: MembershipFee }) => (
    <Card className="hover-lift animated-border transition-smooth">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-medium text-foreground">{fee.memberName}</p>
            <p className="text-xs text-muted-foreground font-mono">{fee.memberId}</p>
          </div>
          <StatusBadge
            status={isUpToDate(fee.status) ? 'success' : 'warning'}
            label={isUpToDate(fee.status) ? 'Al Día' : 'Con Deuda'}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Esperado</p>
            <p className="font-mono text-sm font-medium">{formatCurrencyCompact(fee.expectedContribution)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Pagado</p>
            <p className={cn(
              'font-mono text-sm font-medium',
              fee.paymentMade >= fee.expectedContribution ? 'text-success' : 'text-foreground'
            )}>{formatCurrencyCompact(fee.paymentMade)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Pendiente</p>
            <p className={cn(
              'font-mono text-sm font-medium',
              fee.debt > 0 ? 'text-destructive' : 'text-success'
            )}>{fee.debt > 0 ? formatCurrencyCompact(fee.debt) : '—'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Socio personal view
  if (!isAdmin) {
    // Calculate totals from my fees
    const myTotalExpected = myFees.reduce((sum, f) => sum + f.expectedContribution, 0);
    const myTotalPaid = myFees.reduce((sum, f) => sum + f.paymentMade, 0);
    const myTotalDebt = myFees.reduce((sum, f) => sum + f.debt, 0);

    return (
      <AppLayout title="Mis Cuotas" subtitle="Estado de tus contribuciones">
        <div className="space-y-4 md:space-y-6">
          {/* Personal Status Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-xl md:text-2xl font-bold">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground">Socio de la cooperativa</p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="rounded-lg bg-card p-3 md:p-4 border">
                    <p className="text-xs md:text-sm text-muted-foreground">Contribución Esperada</p>
                    <p className="font-heading text-xl md:text-2xl font-bold text-foreground">
                      {formatCurrency(myTotalExpected)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-card p-3 md:p-4 border">
                    <p className="text-xs md:text-sm text-muted-foreground">Monto Pagado</p>
                    <p className="font-heading text-xl md:text-2xl font-bold text-success">
                      {formatCurrency(myTotalPaid)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-card p-3 md:p-4 border">
                    <p className="text-xs md:text-sm text-muted-foreground">Saldo Pendiente</p>
                    <p className={cn(
                      'font-heading text-xl md:text-2xl font-bold',
                      myTotalDebt > 0 ? 'text-destructive' : 'text-success'
                    )}>
                      {myTotalDebt > 0 ? formatCurrency(myTotalDebt) : 'Ninguno'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg font-heading">Historial de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : myFees.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No hay registros de cuotas</p>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {myFees.map((fee) => (
                    <div
                      key={fee.id}
                      className="flex items-center justify-between py-2 md:py-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        {fee.status === 'up-to-date' ? (
                          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-warning" />
                        )}
                        <span className="font-medium text-sm md:text-base">{fee.period}</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4">
                        <span className={cn(
                          'font-mono text-sm md:text-base',
                          fee.status === 'up-to-date' ? 'text-success' : 'text-foreground'
                        )}>
                          {formatCurrency(fee.paymentMade)}
                        </span>
                        <StatusBadge
                          status={fee.status === 'up-to-date' ? 'success' : 'warning'}
                          label={fee.status === 'up-to-date' ? 'Pagado' : 'Pendiente'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Cuotas de Socios" subtitle={`Seguimiento de contribuciones para ${formatPeriod()}`}>
      <div id="membership-fees-content" className="space-y-4 md:space-y-6">
        {/* Filters & Actions */}
        <Card className="animate-slide-up animated-border" style={{ animationDelay: '0.1s' }}>
          <CardContent className="py-3 md:py-4">
            <div className="flex flex-col gap-3">
              {/* Search and Filter Row */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] h-9">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="up-to-date">Al Día</SelectItem>
                      <SelectItem value="with-debt">Con Deuda</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={handleExport}
                    disabled={isExporting || isLoading}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                    ) : (
                      <Download className="h-4 w-4 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">Excel</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={handleExportPdf}
                    disabled={isExportingPdf || isLoading}
                  >
                    {isExportingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile: Card List */}
        {isMobile && (
          <div className="space-y-3 animate-stagger">
            {filteredData.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No se encontraron socios con los criterios seleccionados
                </CardContent>
              </Card>
            ) : (
              filteredData.map(fee => (
                <MobileMemberCard key={fee.id} fee={fee} />
              ))
            )}
          </div>
        )}

        {/* Desktop: Data Table */}
        {!isMobile && (
          <DataTable
            data={filteredData}
            columns={columns}
            stickyHeader
            emptyMessage="No se encontraron socios con los criterios seleccionados"
          />
        )}

      </div>
    </AppLayout>
  );
}
