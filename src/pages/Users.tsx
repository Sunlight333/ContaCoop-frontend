import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users as UsersIcon,
  UserPlus,
  MoreHorizontal,
  Edit,
  UserX,
  Key,
  Shield,
  User,
  Search,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { userApi, cooperativeApi, Cooperative } from '@/services/api';
import { useCooperative } from '@/contexts/CooperativeContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  rut?: string;
  role: 'admin' | 'socio';
  status: 'active' | 'inactive';
  lastLogin?: string;
  cooperative?: { id: string; name: string } | null;
}

export default function Users() {
  const { selectedCooperative } = useCooperative();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', rut: '', password: '', role: 'socio' as 'admin' | 'socio' });
  const [showPassword, setShowPassword] = useState(false);
  const [createdUserInfo, setCreatedUserInfo] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [allCooperatives, setAllCooperatives] = useState<Cooperative[]>([]);
  const [isCoopDialogOpen, setIsCoopDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [targetCooperativeId, setTargetCooperativeId] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [selectedCooperative, searchTerm]);

  useEffect(() => {
    cooperativeApi.getAll().then(setAllCooperatives).catch(() => {});
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userApi.getAll(searchTerm || undefined, selectedCooperative?.id);
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users;

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error('Por favor, ingrese un correo electrónico válido');
      return;
    }

    // Validate password if provided
    if (newUser.password && newUser.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsCreating(true);
    try {
      const result = await userApi.create(
        {
          name: newUser.name,
          email: newUser.email,
          rut: newUser.rut || undefined,
          role: newUser.role,
          password: newUser.password || undefined
        },
        selectedCooperative?.id
      );

      // Store the created user info to show credentials
      const tempPassword = result?.temporaryPassword || newUser.password;
      if (tempPassword) {
        setCreatedUserInfo({
          name: newUser.name,
          email: newUser.email,
          password: tempPassword
        });
      }

      setNewUser({ name: '', email: '', rut: '', password: '', role: 'socio' });
      setIsCreateOpen(false);
      toast.success('Usuario creado exitosamente');
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.message || 'Error al crear el usuario');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCredentials = () => {
    if (createdUserInfo) {
      const text = `Email: ${createdUserInfo.email}\nContraseña: ${createdUserInfo.password}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Credenciales copiadas al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await userApi.changeStatus(userId, newStatus);
      toast.success('Estado del usuario actualizado');
      fetchUsers();
    } catch (error) {
      console.error('Failed to change status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'socio') => {
    try {
      await userApi.changeRole(userId, newRole);
      toast.success('Rol del usuario actualizado');
      fetchUsers();
    } catch (error) {
      console.error('Failed to change role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  const handleChangeCooperative = async () => {
    if (!selectedUserId || !targetCooperativeId) return;
    try {
      await userApi.changeCooperative(selectedUserId, targetCooperativeId);
      const coopName = allCooperatives.find(c => c.id === targetCooperativeId)?.name;
      toast.success(`${selectedUserName} asignado a ${coopName}`);
      setIsCoopDialogOpen(false);
      setSelectedUserId(null);
      setTargetCooperativeId('');
      fetchUsers();
    } catch (error) {
      console.error('Failed to change cooperative:', error);
      toast.error('Error al cambiar la cooperativa del usuario');
    }
  };

  const openCoopDialog = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setTargetCooperativeId('');
    setIsCoopDialogOpen(true);
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    try {
      const result = await userApi.resetPassword(userId);
      if (result?.temporaryPassword) {
        toast.success(
          `Contraseña restablecida para ${userName}. Nueva contraseña temporal: ${result.temporaryPassword}`,
          { duration: 10000 }
        );
      } else {
        toast.success(`Contraseña restablecida para ${userName}. Se ha enviado un correo con las instrucciones.`);
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error('Error al restablecer la contraseña');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (user: UserData) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium',
            user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      cell: (user: UserData) => (
        <div className="flex items-center gap-2">
          {user.role === 'admin' ? (
            <Shield className="h-4 w-4 text-primary" />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="capitalize">{user.role === 'admin' ? 'Administrador' : 'Socio'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (user: UserData) => (
        <StatusBadge
          status={user.status === 'active' ? 'success' : 'neutral'}
          label={user.status === 'active' ? 'Activo' : 'Inactivo'}
        />
      ),
    },
    {
      key: 'cooperative',
      header: 'Cooperativa',
      cell: (user: UserData) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{user.cooperative?.name || 'Sin asignar'}</span>
        </div>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Último Acceso',
      cell: (user: UserData) => (
        <span className="text-muted-foreground">{user.lastLogin}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      cell: (user: UserData) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" portal={false}>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleChangeRole(user.id, user.role === 'admin' ? 'socio' : 'admin')}>
              <Shield className="h-4 w-4 mr-2" />
              Cambiar a {user.role === 'admin' ? 'Socio' : 'Administrador'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openCoopDialog(user.id, user.name)}>
              <Building2 className="h-4 w-4 mr-2" />
              Asignar Cooperativa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleResetPassword(user.id, user.name)}>
              <Key className="h-4 w-4 mr-2" />
              Restablecer Contraseña
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleToggleStatus(user.id)}
              className={user.status === 'active' ? 'text-destructive focus:text-destructive' : ''}
            >
              <UserX className="h-4 w-4 mr-2" />
              {user.status === 'active' ? 'Desactivar' : 'Activar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.status === 'active').length;

  return (
    <AppLayout title="Usuarios y Roles" subtitle="Gestiona los miembros de la cooperativa y sus permisos" requireAdmin>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3 animate-stagger">
          <Card className="hover-lift animated-border">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <UsersIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Usuarios</p>
                  <p className="font-heading text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift animated-border">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-chart-4/10 p-2">
                  <Shield className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                  <p className="font-heading text-2xl font-bold">{adminCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift animated-border">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <User className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                  <p className="font-heading text-2xl font-bold">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Actions */}
        <Card className="animate-slide-up animated-border">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Agregar Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                      Agregar un nuevo miembro a la plataforma de la cooperativa
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Ingrese el nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="usuario@cooperativa.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rut">RUT</Label>
                      <Input
                        id="rut"
                        value={newUser.rut}
                        onChange={(e) => setNewUser({ ...newUser, rut: e.target.value })}
                        placeholder="12345678-9"
                      />
                      <p className="text-xs text-muted-foreground">
                        Identificador único del país para relación con acciones de cooperativas
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña (opcional)</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Dejar vacío para generar automáticamente"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Si no ingresa contraseña, se generará una automáticamente
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: 'admin' | 'socio') => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent portal={false}>
                          <SelectItem value="socio">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Socio (Miembro)
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Administrador
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateUser} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        'Crear Usuario'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Credentials Dialog */}
              <Dialog open={!!createdUserInfo} onOpenChange={() => setCreatedUserInfo(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-success">
                      <Check className="h-5 w-5" />
                      Usuario Creado Exitosamente
                    </DialogTitle>
                    <DialogDescription>
                      Guarde las credenciales del nuevo usuario. Esta información no se mostrará nuevamente.
                    </DialogDescription>
                  </DialogHeader>
                  {createdUserInfo && (
                    <div className="space-y-4 py-4">
                      <div className="rounded-lg bg-muted p-4 space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Nombre</p>
                          <p className="font-medium">{createdUserInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                          <p className="font-medium">{createdUserInfo.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Contraseña</p>
                          <p className="font-mono font-medium text-primary">{createdUserInfo.password}</p>
                        </div>
                      </div>
                      <Button onClick={handleCopyCredentials} variant="outline" className="w-full">
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar Credenciales
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  <DialogFooter>
                    <Button onClick={() => setCreatedUserInfo(null)}>
                      Cerrar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <DataTable
          data={filteredUsers}
          columns={columns}
          emptyMessage="No se encontraron usuarios"
          mobileCard={(user) => (
            <Card className="animated-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
                      user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" portal={false}>
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleChangeRole(user.id, user.role === 'admin' ? 'socio' : 'admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Cambiar a {user.role === 'admin' ? 'Socio' : 'Administrador'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openCoopDialog(user.id, user.name)}>
                        <Building2 className="h-4 w-4 mr-2" />
                        Asignar Cooperativa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(user.id, user.name)}>
                        <Key className="h-4 w-4 mr-2" />
                        Restablecer Contraseña
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(user.id)}
                        className={user.status === 'active' ? 'text-destructive focus:text-destructive' : ''}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        {user.status === 'active' ? 'Desactivar' : 'Activar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5">
                    {user.role === 'admin' ? (
                      <Shield className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs capitalize">{user.role === 'admin' ? 'Admin' : 'Socio'}</span>
                  </div>
                  <span className="text-muted-foreground">·</span>
                  <StatusBadge
                    status={user.status === 'active' ? 'success' : 'neutral'}
                    label={user.status === 'active' ? 'Activo' : 'Inactivo'}
                  />
                  {user.cooperative?.name && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user.cooperative.name}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        />

        {/* Assign Cooperative Dialog */}
        <Dialog open={isCoopDialogOpen} onOpenChange={setIsCoopDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Cooperativa</DialogTitle>
              <DialogDescription>
                Seleccione la cooperativa a la que desea asignar a <strong>{selectedUserName}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Cooperativa</Label>
                <Select value={targetCooperativeId} onValueChange={setTargetCooperativeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cooperativa" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {allCooperatives.map((coop) => (
                      <SelectItem key={coop.id} value={coop.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {coop.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCoopDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleChangeCooperative} disabled={!targetCooperativeId}>
                Asignar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
