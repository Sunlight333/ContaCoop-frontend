import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  FileUp,
  Info,
  Loader2,
  X,
  Download,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { uploadApi, odooSyncApi, settingsApi } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';
import { generateExcelTemplate } from '@/lib/excelTemplates';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const years = ['2025', '2024', '2023', '2022'];

const uploadModules = [
  {
    id: 'balance-sheet',
    name: 'Balance General',
    description: 'Datos del balance de comprobación',
    columns: ['codigo_cuenta', 'nombre_cuenta', 'tipo_cuenta', 'monto', 'cuenta_padre'],
    formatInfo: 'tipo_cuenta: activo, pasivo, patrimonio'
  },
  {
    id: 'cash-flow',
    name: 'Flujo de Caja',
    description: 'Estado de flujo de efectivo',
    columns: ['tipo_actividad', 'descripcion', 'monto'],
    formatInfo: 'tipo_actividad: operacion, inversion, financiamiento'
  },
  {
    id: 'membership-fees',
    name: 'Cuotas de Socios',
    description: 'Contribuciones de los miembros',
    columns: ['id_socio', 'nombre_socio', 'email', 'tipo_cuota', 'monto_esperado', 'monto_pagado', 'fecha_pago', 'estado'],
    formatInfo: 'estado: pagado, parcial, pendiente, atrasado'
  },
  {
    id: 'ratios',
    name: 'Ratios Financieros',
    description: 'Datos de ratios clave',
    columns: ['nombre_ratio', 'valor', 'tendencia', 'descripcion'],
    formatInfo: 'tendencia: up, down, stable'
  },
];

interface UploadHistoryItem {
  id: string;
  period: string;
  date: string;
  user: string;
  status: 'success' | 'partial' | 'failed';
  modules: string[];
}

export default function DataUpload() {
  const { selectedCooperative } = useCooperative();
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [uploadStates, setUploadStates] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [odooConnected, setOdooConnected] = useState(false);
  const [isSyncingOdoo, setIsSyncingOdoo] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchHistory();
    checkOdooStatus();
  }, [selectedCooperative]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await uploadApi.getHistory(20, selectedCooperative?.id);
      setUploadHistory(data || []);
    } catch (error) {
      console.error('Failed to fetch upload history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const checkOdooStatus = async () => {
    try {
      const status = await settingsApi.getOdooStatus(selectedCooperative?.id);
      setOdooConnected(status?.isConnected || false);
    } catch (error) {
      console.error('Failed to check Odoo status:', error);
      setOdooConnected(false);
    }
  };

  const handleSyncFromOdoo = async (moduleId: string) => {
    setIsSyncingOdoo(prev => ({ ...prev, [moduleId]: true }));
    try {
      const year = Number(selectedYear);
      const month = Number(selectedMonth);

      let result;
      switch (moduleId) {
        case 'balance-sheet':
          result = await odooSyncApi.syncBalanceSheet(year, month, selectedCooperative?.id);
          break;
        case 'cash-flow':
          result = await odooSyncApi.syncCashFlow(year, month, selectedCooperative?.id);
          break;
        case 'membership-fees':
          result = await odooSyncApi.syncMembershipFees(year, month, selectedCooperative?.id);
          break;
        default:
          toast.error('Módulo no soportado para sincronización con Odoo');
          return;
      }

      if (result) {
        toast.success(`${result.recordsCount} registros sincronizados desde Odoo`);
        await fetchHistory();
      }
    } catch (error: any) {
      console.error('Odoo sync failed:', error);
      toast.error(error?.message || 'Error al sincronizar con Odoo');
    } finally {
      setIsSyncingOdoo(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const handleFileSelect = (moduleId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast.error('Por favor seleccione un archivo Excel (.xlsx, .xls) o CSV');
        return;
      }
      setSelectedFiles(prev => ({ ...prev, [moduleId]: file }));
      setUploadStates(prev => ({ ...prev, [moduleId]: 'idle' }));
    }
  };

  const handleClearFile = (moduleId: string) => {
    setSelectedFiles(prev => ({ ...prev, [moduleId]: null }));
    setUploadStates(prev => ({ ...prev, [moduleId]: 'idle' }));
    if (fileInputRefs.current[moduleId]) {
      fileInputRefs.current[moduleId]!.value = '';
    }
  };

  const handleDownloadTemplate = (moduleId: string, moduleName: string) => {
    try {
      generateExcelTemplate(moduleId);
      toast.success(`Plantilla de ${moduleName} descargada`);
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Error al generar la plantilla');
    }
  };

  const handleUpload = async (moduleId: string) => {
    const file = selectedFiles[moduleId];
    if (!file) {
      toast.error('Por favor seleccione un archivo primero');
      return;
    }

    setUploadStates(prev => ({ ...prev, [moduleId]: 'uploading' }));

    try {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);

      let result;
      switch (moduleId) {
        case 'balance-sheet':
          result = await uploadApi.uploadBalanceSheet(file, year, month, overwriteExisting, selectedCooperative?.id);
          break;
        case 'cash-flow':
          result = await uploadApi.uploadCashFlow(file, year, month, overwriteExisting, selectedCooperative?.id);
          break;
        case 'membership-fees':
          result = await uploadApi.uploadMembershipFees(file, year, month, overwriteExisting, selectedCooperative?.id);
          break;
        case 'ratios':
          result = await uploadApi.uploadRatios(file, year, month, overwriteExisting, selectedCooperative?.id);
          break;
      }

      setUploadStates(prev => ({ ...prev, [moduleId]: 'success' }));
      toast.success(`${result?.message || 'Archivo cargado exitosamente'}`);
      fetchHistory();
    } catch (error: any) {
      setUploadStates(prev => ({ ...prev, [moduleId]: 'error' }));
      toast.error(error.message || 'Error al cargar el archivo');
    }
  };

  const getUploadIcon = (state: string) => {
    switch (state) {
      case 'uploading': return <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-primary" />;
      case 'success': return <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-destructive" />;
      default: return <FileUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />;
    }
  };

  // Mobile history card
  const MobileHistoryCard = ({ item }: { item: UploadHistoryItem }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{item.date}</span>
          </div>
          <StatusBadge
            status={item.status === 'success' ? 'success' : item.status === 'failed' ? 'error' : 'warning'}
            label={item.status === 'success' ? 'Completo' : item.status === 'failed' ? 'Fallido' : 'Parcial'}
          />
        </div>
        <p className="text-sm text-muted-foreground mb-2">{item.period} por {item.user}</p>
        <div className="flex flex-wrap gap-1">
          {item.modules.map((module) => (
            <span key={module} className="px-2 py-0.5 bg-muted rounded text-xs">
              {module}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const historyColumns = [
    {
      key: 'date',
      header: 'Fecha y Hora',
      cell: (item: UploadHistoryItem) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{item.date}</span>
        </div>
      ),
    },
    { key: 'user', header: 'Cargado Por' },
    { key: 'period', header: 'Período' },
    {
      key: 'modules',
      header: 'Módulos',
      cell: (item: UploadHistoryItem) => (
        <div className="flex flex-wrap gap-1">
          {item.modules.map((module) => (
            <span key={module} className="px-2 py-0.5 bg-muted rounded text-xs">
              {module}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center' as const,
      cell: (item: UploadHistoryItem) => (
        <StatusBadge
          status={item.status === 'success' ? 'success' : item.status === 'failed' ? 'error' : 'warning'}
          label={item.status === 'success' ? 'Completo' : item.status === 'failed' ? 'Fallido' : 'Parcial'}
        />
      ),
    },
  ];

  return (
    <AppLayout title="Carga de Datos" subtitle="Importar archivos Excel para actualizar datos financieros" requireAdmin>
      <div className="space-y-4 md:space-y-6">
        {/* Period Selection */}
        <Card className="animate-slide-up hover-lift animated-border">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg font-heading">Seleccionar Período</CardTitle>
            <CardDescription className="text-xs md:text-sm">Elija el mes y año para la importación de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
              <div className="space-y-2 flex-1 sm:flex-initial">
                <Label className="text-xs md:text-sm">Año</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent portal={false}>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 sm:flex-initial">
                <Label className="text-xs md:text-sm">Mes</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent portal={false}>
                    {months.map((month, i) => (
                      <SelectItem key={month} value={String(i + 1)}>
                        <span className="hidden sm:inline">{month}</span>
                        <span className="sm:hidden">{shortMonths[i]}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end flex-1 sm:flex-initial">
                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-muted rounded-lg w-full sm:w-auto">
                  <Switch
                    id="overwrite"
                    checked={overwriteExisting}
                    onCheckedChange={setOverwriteExisting}
                  />
                  <Label htmlFor="overwrite" className="text-xs md:text-sm cursor-pointer">
                    <span className="hidden sm:inline">Sobrescribir datos existentes</span>
                    <span className="sm:hidden">Sobrescribir</span>
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Format Info */}
        <Card className="animate-slide-up bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" style={{ animationDelay: '0.05s' }}>
          <CardContent className="py-3 md:py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 p-2 flex-shrink-0">
                <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Formatos de archivo aceptados</p>
                <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                  Puede cargar archivos <strong>Excel (.xlsx, .xls)</strong> o <strong>CSV</strong>.
                  Descargue las plantillas de ejemplo para ver el formato requerido de cada módulo.
                  Las columnas deben coincidir exactamente con los nombres especificados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Modules */}
        <Card className="animate-slide-up animated-border" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg font-heading">Cargar Archivos</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Seleccione archivos Excel (.xlsx, .xls) o CSV para cada módulo financiero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
              {uploadModules.map((module) => {
                const state = uploadStates[module.id] || 'idle';
                const selectedFile = selectedFiles[module.id];

                return (
                  <div
                    key={module.id}
                    className={cn(
                      'relative rounded-lg border-2 border-dashed p-4 md:p-6 transition-all',
                      state === 'idle' && 'border-border hover:border-primary/50 hover:bg-muted/30',
                      state === 'uploading' && 'border-primary/50 bg-primary/5',
                      state === 'success' && 'border-success/50 bg-success/5',
                      state === 'error' && 'border-destructive/50 bg-destructive/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={cn(
                          'rounded-lg p-1.5 md:p-2',
                          state === 'idle' && 'bg-muted',
                          state === 'uploading' && 'bg-primary/10',
                          state === 'success' && 'bg-success/10',
                          state === 'error' && 'bg-destructive/10'
                        )}>
                          <FileSpreadsheet className={cn(
                            'h-5 w-5 md:h-6 md:w-6',
                            state === 'idle' && 'text-muted-foreground',
                            state === 'uploading' && 'text-primary',
                            state === 'success' && 'text-success',
                            state === 'error' && 'text-destructive'
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm md:text-base text-foreground">{module.name}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="flex-shrink-0">
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium text-xs">Columnas requeridas:</p>
                                  <p className="text-xs text-muted-foreground">{module.columns.join(', ')}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{module.formatInfo}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getUploadIcon(state)}
                      </div>
                    </div>

                    {/* File selection */}
                    <div className="mt-3 md:mt-4 space-y-2">
                      {/* Download template button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs text-muted-foreground hover:text-primary justify-start px-2"
                        onClick={() => handleDownloadTemplate(module.id, module.name)}
                      >
                        <Download className="h-3 w-3 mr-1.5" />
                        Descargar plantilla de ejemplo
                      </Button>

                      <input
                        type="file"
                        ref={(el) => fileInputRefs.current[module.id] = el}
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => handleFileSelect(module.id, e)}
                        className="hidden"
                        id={`file-${module.id}`}
                      />

                      {selectedFile ? (
                        <div className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileSpreadsheet className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-xs md:text-sm truncate">{selectedFile.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleClearFile(module.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <label
                          htmlFor={`file-${module.id}`}
                          className="flex items-center justify-center gap-2 p-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs md:text-sm text-muted-foreground">
                            Seleccionar archivo Excel
                          </span>
                        </label>
                      )}

                      <Button
                        variant={state === 'success' ? 'outline' : 'default'}
                        size="sm"
                        className="w-full h-8 md:h-9 text-xs md:text-sm"
                        disabled={state === 'uploading' || !selectedFile}
                        onClick={() => handleUpload(module.id)}
                      >
                        {state === 'uploading' ? (
                          <>
                            <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                            {state === 'success' ? 'Cargar Otro' : 'Cargar Archivo'}
                          </>
                        )}
                      </Button>
                    </div>

                    {state === 'error' && (
                      <p className="mt-2 md:mt-3 text-xs md:text-sm text-destructive flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Error en la carga del archivo
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Import History */}
        <Card className="animate-slide-up animated-border" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg font-heading">Historial de Importaciones</CardTitle>
            <CardDescription className="text-xs md:text-sm">Cargas de datos recientes y su estado</CardDescription>
          </CardHeader>
          {isMobile ? (
            <CardContent className="space-y-3">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : uploadHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No hay cargas aún</p>
              ) : (
                uploadHistory.map(item => (
                  <MobileHistoryCard key={item.id} item={item} />
                ))
              )}
            </CardContent>
          ) : (
            <CardContent className="p-0">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable
                  data={uploadHistory}
                  columns={historyColumns}
                  emptyMessage="No hay cargas aún"
                />
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
