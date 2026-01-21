import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Building2,
  Bell,
  Shield,
  Database,
  Download,
  Globe,
  Mail,
  Loader2,
  Palette
} from 'lucide-react';
import { settingsApi, cooperativeApi, downloadBlob } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';

interface CooperativeInfo {
  name: string;
  ruc?: string;
  address?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  uploadNotifications: boolean;
  paymentReminders: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: boolean;
}

interface DataSettings {
  autoBackup: boolean;
}

interface OdooConfig {
  url: string;
  database: string;
  username: string;
  apiKey: string;
  isConnected: boolean;
  lastSync?: string;
}

export default function Settings() {
  const { selectedCooperative } = useCooperative();
  const [coopInfo, setCoopInfo] = useState<CooperativeInfo>({ name: '' });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    uploadNotifications: true,
    paymentReminders: false,
  });
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: true,
  });
  const [dataSettings, setDataSettings] = useState<DataSettings>({
    autoBackup: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [odooConfig, setOdooConfig] = useState<OdooConfig>({
    url: '',
    database: '',
    username: '',
    apiKey: '',
    isConnected: false,
  });
  const [isTestingOdoo, setIsTestingOdoo] = useState(false);
  const [isSavingOdoo, setIsSavingOdoo] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [selectedCooperative]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const [settingsData, coopData, odooStatus] = await Promise.all([
        settingsApi.get(selectedCooperative?.id),
        cooperativeApi.getInfo(selectedCooperative?.id),
        settingsApi.getOdooStatus(selectedCooperative?.id).catch(() => null),
      ]);

      if (settingsData) {
        setNotifications({
          emailNotifications: settingsData.emailNotifications ?? true,
          uploadNotifications: settingsData.uploadNotifications ?? true,
          paymentReminders: settingsData.paymentReminders ?? false,
        });
        setSecurity({
          twoFactorAuth: settingsData.twoFactorAuth ?? false,
          sessionTimeout: settingsData.sessionTimeout ?? true,
        });
        setDataSettings({
          autoBackup: settingsData.autoBackup ?? true,
        });
      }

      if (coopData) {
        setCoopInfo({
          name: coopData.name || '',
          ruc: coopData.ruc || '',
          address: coopData.address || '',
        });
      }

      if (odooStatus) {
        setOdooConfig({
          url: odooStatus.url || '',
          database: odooStatus.database || '',
          username: odooStatus.username || '',
          apiKey: odooStatus.apiKey || '',
          isConnected: odooStatus.isConnected || false,
          lastSync: odooStatus.lastSync || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCoopInfo = async () => {
    setIsSaving(true);
    try {
      await cooperativeApi.updateInfo(selectedCooperative?.id || '', coopInfo);
      toast.success('Información guardada exitosamente');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Error al guardar la información');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notifications, [key]: value };
    setNotifications(newSettings);
    try {
      await settingsApi.updateNotifications(newSettings, selectedCooperative?.id);
      toast.success('Notificaciones actualizadas');
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast.error('Error al actualizar notificaciones');
      setNotifications(notifications);
    }
  };

  const handleSecurityChange = async (key: keyof SecuritySettings, value: boolean) => {
    const newSettings = { ...security, [key]: value };
    setSecurity(newSettings);
    try {
      await settingsApi.updateSecurity(newSettings, selectedCooperative?.id);
      toast.success('Configuración de seguridad actualizada');
    } catch (error) {
      console.error('Failed to update security settings:', error);
      toast.error('Error al actualizar seguridad');
      setSecurity(security);
    }
  };

  const handleBackupChange = async (value: boolean) => {
    const newSettings = { autoBackup: value };
    setDataSettings(newSettings);
    try {
      await settingsApi.updateBackups(newSettings, selectedCooperative?.id);
      toast.success('Configuración de respaldos actualizada');
    } catch (error) {
      console.error('Failed to update backup settings:', error);
      toast.error('Error al actualizar configuración de respaldos');
      setDataSettings(dataSettings);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const blob = await settingsApi.exportAllData(selectedCooperative?.id);
      downloadBlob(blob, `datos-cooperativa-${new Date().toISOString().split('T')[0]}.json`);
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
  };

  const testOdooConnection = async () => {
    setIsTestingOdoo(true);
    try {
      const result = await settingsApi.testOdooConnection({
        url: odooConfig.url,
        database: odooConfig.database,
        username: odooConfig.username,
        apiKey: odooConfig.apiKey,
      });

      if (result?.success) {
        toast.success(result.message || 'Conexión exitosa con Odoo');
        setOdooConfig({ ...odooConfig, isConnected: true });
      } else {
        toast.error(result?.message || 'Error al conectar con Odoo');
        setOdooConfig({ ...odooConfig, isConnected: false });
      }
    } catch (error) {
      console.error('Odoo connection test failed:', error);
      toast.error('Error al probar conexión con Odoo');
      setOdooConfig({ ...odooConfig, isConnected: false });
    } finally {
      setIsTestingOdoo(false);
    }
  };

  const saveOdooConfig = async () => {
    setIsSavingOdoo(true);
    try {
      await settingsApi.saveOdooConfig({
        url: odooConfig.url,
        database: odooConfig.database,
        username: odooConfig.username,
        apiKey: odooConfig.apiKey,
      }, selectedCooperative?.id);
      toast.success('Configuración de Odoo guardada exitosamente');
      await fetchSettings(); // Refresh status
    } catch (error) {
      console.error('Failed to save Odoo config:', error);
      toast.error('Error al guardar configuración de Odoo');
    } finally {
      setIsSavingOdoo(false);
    }
  };

  return (
    <AppLayout title="Configuración" subtitle="Configura las preferencias de la plataforma" requireAdmin>
      <div className="space-y-4 md:space-y-6">
        {/* Two Column Layout for larger screens */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Cooperative Info */}
          <Card className="animate-slide-up hover-lift animated-border">
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base md:text-lg font-heading">Información de la Cooperativa</CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm">Información básica de tu cooperativa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coop-name" className="text-sm">Nombre de la Cooperativa</Label>
                  <Input
                    id="coop-name"
                    value={coopInfo.name}
                    onChange={(e) => setCoopInfo({ ...coopInfo, name: e.target.value })}
                    className="h-9 md:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coop-id" className="text-sm">RUC / Registro</Label>
                  <Input
                    id="coop-id"
                    value={coopInfo.ruc || ''}
                    onChange={(e) => setCoopInfo({ ...coopInfo, ruc: e.target.value })}
                    className="h-9 md:h-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coop-address" className="text-sm">Dirección</Label>
                <Input
                  id="coop-address"
                  value={coopInfo.address || ''}
                  onChange={(e) => setCoopInfo({ ...coopInfo, address: e.target.value })}
                  className="h-9 md:h-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="transition-all duration-300 hover:scale-105"
                onClick={handleSaveCoopInfo}
                disabled={isSaving}
              >
                <Loader2 className={cn("h-4 w-4 mr-2 animate-spin", isSaving ? "inline" : "hidden")} />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.05s' }}>
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base md:text-lg font-heading">Notificaciones</CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm">Configura las notificaciones por correo y del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Notificaciones por Correo</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Recibir notificaciones vía correo electrónico</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Confirmaciones de Carga</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Notificar cuando se suban datos</p>
                </div>
                <Switch
                  checked={notifications.uploadNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('uploadNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Recordatorios de Pago</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Enviar recordatorios a socios con cuotas pendientes</p>
                </div>
                <Switch
                  checked={notifications.paymentReminders}
                  onCheckedChange={(checked) => handleNotificationChange('paymentReminders', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance/Theme */}
          <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle className="text-base md:text-lg font-heading">Apariencia</CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm">Personaliza el tema de la interfaz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Tema de la Interfaz</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Selecciona el modo claro, oscuro o automático</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.15s' }}>
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base md:text-lg font-heading">Seguridad</CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm">Configuración de seguridad y acceso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Autenticación de Dos Factores</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Requerir 2FA para cuentas de administrador</p>
                </div>
                <Switch
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Tiempo de Sesión</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Cerrar sesión automáticamente por inactividad</p>
                </div>
                <Switch
                  checked={security.sessionTimeout}
                  onCheckedChange={(checked) => handleSecurityChange('sessionTimeout', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="text-base md:text-lg font-heading">Gestión de Datos</CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm">Opciones de respaldo y exportación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Respaldos Automáticos</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Respaldos diarios automatizados</p>
                </div>
                <Switch
                  checked={dataSettings.autoBackup}
                  onCheckedChange={handleBackupChange}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Exportar Todos los Datos</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Descargar datos completos de la cooperativa</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-300 hover:scale-105 flex-shrink-0"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  <Loader2 className={cn("h-4 w-4 mr-2 animate-spin", isExporting ? "inline" : "hidden")} />
                  <Download className={cn("h-4 w-4 mr-2", isExporting ? "hidden" : "inline")} />
                  <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Odoo Integration - Full Width */}
        <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.25s' }}>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-base md:text-lg font-heading">Integración con Odoo</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm">Conectar con Odoo ERP para sincronizar datos contables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  odooConfig.isConnected ? "bg-green-500 animate-pulse" : "bg-gray-300"
                )}></div>
                <div>
                  <p className="font-medium text-sm">Estado de Conexión</p>
                  <p className="text-xs text-muted-foreground">
                    {odooConfig.isConnected ? 'Conectado' : 'No conectado'}
                    {odooConfig.lastSync && ` - Última sincronización: ${new Date(odooConfig.lastSync).toLocaleString('es-CL')}`}
                  </p>
                </div>
              </div>
              <Button
                variant={odooConfig.isConnected ? "outline" : "default"}
                size="sm"
                onClick={testOdooConnection}
                disabled={isTestingOdoo || !odooConfig.url || !odooConfig.database}
              >
                <Loader2 className={cn("h-4 w-4 mr-2 animate-spin", isTestingOdoo ? "inline" : "hidden")} />
                {isTestingOdoo ? 'Probando...' : 'Probar Conexión'}
              </Button>
            </div>

            {/* Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL de Odoo</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground"
                  placeholder="https://odoo.ejemplo.com"
                  value={odooConfig.url}
                  onChange={(e) => setOdooConfig({ ...odooConfig, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Base de Datos</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground"
                  placeholder="nombre_bd"
                  value={odooConfig.database}
                  onChange={(e) => setOdooConfig({ ...odooConfig, database: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Usuario</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground"
                  placeholder="usuario@ejemplo.com"
                  value={odooConfig.username}
                  onChange={(e) => setOdooConfig({ ...odooConfig, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key / Contraseña</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground"
                  placeholder="••••••••"
                  value={odooConfig.apiKey}
                  onChange={(e) => setOdooConfig({ ...odooConfig, apiKey: e.target.value })}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={saveOdooConfig}
                disabled={isSavingOdoo || !odooConfig.url || !odooConfig.database || !odooConfig.username || !odooConfig.apiKey}
              >
                <Loader2 className={cn("h-4 w-4 mr-2 animate-spin", isSavingOdoo ? "inline" : "hidden")} />
                {isSavingOdoo ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
