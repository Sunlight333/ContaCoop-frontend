import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Correo electrónico o contraseña inválidos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Imagen de fondo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/login-bg.png"
          alt="Plataforma Financiera Cooperativa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay gradient for better text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
      </div>

      {/* Panel Derecho - Formulario de Inicio de Sesión */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        {/* Subtle background pattern for mobile */}
        <div className="lg:hidden absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        </div>

        {/* Mobile: Back button and mini branding */}
        <div className="lg:hidden absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm">ContaCoop</span>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10 mt-12 lg:mt-0">
          {/* Desktop: Back link */}
          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <h2 className="font-heading text-2xl font-bold text-foreground">Bienvenido de nuevo</h2>
            <p className="text-muted-foreground mt-1">Inicia sesión para acceder a tu panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@cooperativa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button type="submit" className="w-full h-11 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border animate-slide-up animated-border" style={{ animationDelay: '0.25s' }}>
            <p className="text-sm text-muted-foreground mb-2">Credenciales de demostración:</p>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium text-foreground">Admin:</span> admin@cooperative.com / admin123</p>
              <p><span className="font-medium text-foreground">Socio:</span> socio@cooperative.com / socio123</p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '0.3s' }}>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
