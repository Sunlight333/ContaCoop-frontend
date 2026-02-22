import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCooperative } from '@/contexts/CooperativeContext';
import { usePeriod } from '@/contexts/PeriodContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Mail, Building2, Calendar, Shield, Key, Loader2, Eye, EyeOff, CreditCard } from 'lucide-react';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const { selectedCooperative, setSelectedCooperative, cooperatives, isLoading: coopLoading } = useCooperative();
  const { selectedPeriod, setSelectedPeriod } = usePeriod();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Contraseña actualizada exitosamente');
      setIsPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AppLayout title="Mi Perfil" subtitle="Ver y gestionar la configuración de tu cuenta">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Profile Header */}
        <Card className="animate-slide-up hover-lift animated-border">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl font-semibold">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-sm">
                    <Shield className="h-3 w-3 text-primary" />
                    <span className="capitalize text-primary font-medium">
                      {user?.role === 'admin' ? 'Administrador' : 'Socio'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">Miembro desde 2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.05s' }}>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Información Personal</CardTitle>
            <CardDescription>Detalles de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullname">Nombre Completo</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input id="fullname" defaultValue={user?.name} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input id="email" defaultValue={user?.email} readOnly className="bg-muted" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="rut"
                    defaultValue={user?.rut || 'No especificado'}
                    readOnly
                    className="bg-muted"
                    placeholder="12345678-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-id">ID de Usuario</Label>
                <Input id="member-id" defaultValue={user?.id || 'N/A'} readOnly className="bg-muted" />
              </div>
            </div>

            {/* Cooperative Selector - For Socios */}
            {!isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="coop-select">Mis Cooperativas</Label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {coopLoading ? (
                    <Input
                      id="coop-loading"
                      value="Cargando cooperativas..."
                      readOnly
                      className="flex-1 bg-muted"
                      disabled
                    />
                  ) : cooperatives.length > 1 ? (
                    <Select
                      value={selectedCooperative?.id}
                      onValueChange={(value) => {
                        const coop = cooperatives.find((c) => c.id === value);
                        if (coop) {
                          setSelectedCooperative(coop);
                          toast.success(`Cambiado a ${coop.name}`);
                        }
                      }}
                    >
                      <SelectTrigger id="coop-select" className="flex-1">
                        <SelectValue placeholder="Selecciona una cooperativa" />
                      </SelectTrigger>
                      <SelectContent portal={false}>
                        {cooperatives.map((coop) => (
                          <SelectItem key={coop.id} value={coop.id}>
                            {coop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : cooperatives.length === 1 ? (
                    <Input
                      id="coop-single"
                      value={selectedCooperative?.name || cooperatives[0]?.name || 'Sin cooperativa'}
                      readOnly
                      className="flex-1 bg-muted"
                    />
                  ) : (
                    <Input
                      id="coop-none"
                      value="No tienes cooperativas asignadas"
                      readOnly
                      className="flex-1 bg-muted"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {coopLoading
                    ? 'Cargando información...'
                    : cooperatives.length > 1
                    ? 'Selecciona la cooperativa que deseas visualizar'
                    : cooperatives.length === 1
                    ? 'Esta es tu cooperativa asignada'
                    : 'Contacta al administrador para asignarte a una cooperativa'}
                </p>
              </div>
            )}

            {/* Cooperative & Year Selector - For Admins */}
            {isAdmin && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="admin-coop-select">Cooperativa</Label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {coopLoading ? (
                        <Input
                          id="admin-coop-loading"
                          value="Cargando cooperativas..."
                          readOnly
                          className="flex-1 bg-muted"
                          disabled
                        />
                      ) : cooperatives.length > 0 ? (
                        <Select
                          value={selectedCooperative?.id}
                          onValueChange={(value) => {
                            const coop = cooperatives.find((c) => c.id === value);
                            if (coop) {
                              setSelectedCooperative(coop);
                              toast.success(`Cambiado a ${coop.name}`);
                            }
                          }}
                        >
                          <SelectTrigger id="admin-coop-select" className="flex-1">
                            <SelectValue placeholder="Selecciona cooperativa" />
                          </SelectTrigger>
                          <SelectContent portal={false}>
                            {cooperatives.map((coop) => (
                              <SelectItem key={coop.id} value={coop.id}>
                                {coop.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="admin-coop-none"
                          value="No hay cooperativas disponibles"
                          readOnly
                          className="flex-1 bg-muted"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year-select">Año</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) => {
                          setSelectedYear(parseInt(value));
                          toast.success(`Año cambiado a ${value}`);
                        }}
                      >
                        <SelectTrigger id="year-select" className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent portal={false}>
                          {[2024, 2023, 2022, 2021, 2020].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gestiona la cooperativa y año para visualizar datos
                </p>
              </>
            )}
            <p className="text-sm text-muted-foreground">
              Contacta a un administrador para actualizar tu información personal.
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Seguridad</CardTitle>
            <CardDescription>Gestiona tu contraseña y configuración de seguridad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2 flex-shrink-0">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Contraseña</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Última modificación hace 30 días</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setIsPasswordDialogOpen(true)}>
                Cambiar Contraseña
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Último Acceso</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('es-ES') : 'Ahora mismo'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="animate-slide-up hover-lift animated-border" style={{ animationDelay: '0.15s' }}>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Actividad Reciente</CardTitle>
            <CardDescription>Tus acciones recientes en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Vio el Balance General', time: 'Hace 2 horas' },
                { action: 'Vio el Reporte de Flujo de Caja', time: 'Hace 3 horas' },
                { action: 'Inició sesión', time: 'Hace 4 horas' },
                { action: 'Vio el Panel Principal', time: 'Ayer' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{activity.action}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="translate-no">
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Ingresa tu contraseña actual y la nueva contraseña
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4" translate="no">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Ingresa tu contraseña actual"
                    translate="no"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Ingresa tu nueva contraseña"
                    translate="no"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirma tu nueva contraseña"
                    translate="no"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={isChangingPassword}
              >
                Cancelar
              </Button>
              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Contraseña'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
