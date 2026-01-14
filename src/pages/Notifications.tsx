import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import {
  Bell,
  Send,
  Users,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { notificationApi, userApi } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';
import { cn } from '@/lib/utils';

interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  recipientType: 'all' | 'with_debt' | 'specific';
  recipientCount: number;
  senderName: string;
  createdAt: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function Notifications() {
  const { selectedCooperative } = useCooperative();
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    recipientType: 'all' as 'all' | 'with_debt' | 'specific',
    specificUserIds: [] as string[],
  });

  useEffect(() => {
    fetchHistory();
    fetchUsers();
  }, [selectedCooperative]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await notificationApi.getHistory(50, selectedCooperative?.id);
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
      toast.error('Error al cargar el historial de notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userApi.getAll(undefined, selectedCooperative?.id);
      setUsers(data?.filter((u: any) => u.role === 'socio' && u.status === 'active') || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Por favor, complete el título y mensaje');
      return;
    }

    if (newNotification.recipientType === 'specific' && newNotification.specificUserIds.length === 0) {
      toast.error('Por favor, seleccione al menos un destinatario');
      return;
    }

    setIsSending(true);
    try {
      const result = await notificationApi.send(newNotification, selectedCooperative?.id);
      toast.success(`Notificación enviada a ${result?.recipientCount} usuario(s)`);
      setNewNotification({
        title: '',
        message: '',
        recipientType: 'all',
        specificUserIds: [],
      });
      setIsCreateOpen(false);
      fetchHistory();
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast.error(error.message || 'Error al enviar la notificación');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'all':
        return 'Todos los socios';
      case 'with_debt':
        return 'Socios con deuda';
      case 'specific':
        return 'Usuarios específicos';
      default:
        return type;
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Notificación',
      cell: (item: NotificationHistoryItem) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{item.message}</p>
        </div>
      ),
    },
    {
      key: 'recipientType',
      header: 'Destinatarios',
      cell: (item: NotificationHistoryItem) => (
        <div>
          <p className="text-sm">{getRecipientTypeLabel(item.recipientType)}</p>
          <p className="text-xs text-muted-foreground">{item.recipientCount} usuario(s)</p>
        </div>
      ),
    },
    {
      key: 'sender',
      header: 'Enviado por',
      cell: (item: NotificationHistoryItem) => (
        <span className="text-sm">{item.senderName}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      cell: (item: NotificationHistoryItem) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatDate(item.createdAt)}
        </div>
      ),
    },
  ];

  const totalNotifications = history.length;
  const totalRecipients = history.reduce((sum, n) => sum + n.recipientCount, 0);

  return (
    <AppLayout
      title="Notificaciones"
      subtitle="Envía mensajes y recordatorios a los socios"
      requireAdmin
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3 animate-stagger">
          <Card className="hover-lift animated-border">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Enviadas</p>
                  <p className="font-heading text-2xl font-bold">{totalNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift animated-border">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-chart-4/10 p-2">
                  <Users className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Destinatarios</p>
                  <p className="font-heading text-2xl font-bold">{totalRecipients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift animated-border">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Socios Activos</p>
                  <p className="font-heading text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Send Notification */}
        <Card className="animate-slide-up animated-border">
          <CardContent className="py-4">
            <div className="flex justify-end">
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Notificación
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Enviar Nueva Notificación</DialogTitle>
                    <DialogDescription>
                      Envía un mensaje o recordatorio a los socios de la cooperativa
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                        placeholder="Ej: Recordatorio de pago de cuotas"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje *</Label>
                      <Textarea
                        id="message"
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                        placeholder="Escribe tu mensaje aquí..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipientType">Destinatarios *</Label>
                      <Select
                        value={newNotification.recipientType}
                        onValueChange={(value: 'all' | 'with_debt' | 'specific') =>
                          setNewNotification({ ...newNotification, recipientType: value, specificUserIds: [] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar destinatarios" />
                        </SelectTrigger>
                        <SelectContent portal={false}>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Todos los socios activos
                            </div>
                          </SelectItem>
                          <SelectItem value="with_debt">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              Solo socios con deuda
                            </div>
                          </SelectItem>
                          <SelectItem value="specific">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Usuarios específicos
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newNotification.recipientType === 'specific' && (
                      <div className="space-y-2">
                        <Label>Seleccionar Usuarios</Label>
                        <div className="border rounded-md max-h-[200px] overflow-y-auto">
                          {users.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-4 text-center">
                              No hay socios activos disponibles
                            </p>
                          ) : (
                            users.map((user) => (
                              <label
                                key={user.id}
                                className={cn(
                                  'flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0',
                                  newNotification.specificUserIds.includes(user.id) && 'bg-primary/5'
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={newNotification.specificUserIds.includes(user.id)}
                                  onChange={(e) => {
                                    const userIds = e.target.checked
                                      ? [...newNotification.specificUserIds, user.id]
                                      : newNotification.specificUserIds.filter((id) => id !== user.id);
                                    setNewNotification({ ...newNotification, specificUserIds: userIds });
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                              </label>
                            ))
                          )}
                        </div>
                        {newNotification.specificUserIds.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {newNotification.specificUserIds.length} usuario(s) seleccionado(s)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      disabled={isSending}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSendNotification} disabled={isSending}>
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card className="animate-slide-up animated-border" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle>Historial de Notificaciones</CardTitle>
            <CardDescription>
              Registro de todas las notificaciones enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DataTable
                data={history}
                columns={columns}
                emptyMessage="No se han enviado notificaciones"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
