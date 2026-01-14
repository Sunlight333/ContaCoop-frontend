import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  EyeOff,
  Loader2,
  Building2,
  ArrowLeft,
  CheckCircle,
  Users,
  Shield,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { authApi } from '@/services/api';

const cooperativeTypes = [
  { value: 'ahorro-credito', label: 'Ahorro y Crédito' },
  { value: 'vivienda', label: 'Vivienda' },
  { value: 'consumo', label: 'Consumo' },
  { value: 'produccion', label: 'Producción' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'otra', label: 'Otra' },
];

const benefits = [
  { icon: Users, text: 'Gestiona hasta 25 socios gratis' },
  { icon: Zap, text: 'Configuración en minutos' },
  { icon: Shield, text: 'Datos 100% seguros y encriptados' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    cooperativeName: '',
    cooperativeType: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.cooperativeName.trim()) {
      toast.error('Ingresa el nombre de la cooperativa');
      return false;
    }
    if (!formData.cooperativeType) {
      toast.error('Selecciona el tipo de cooperativa');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.adminName.trim()) {
      toast.error('Ingresa tu nombre completo');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Ingresa tu correo electrónico');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Ingresa un correo electrónico válido');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error('La contraseña debe contener al menos una letra mayúscula');
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      toast.error('La contraseña debe contener al menos una letra minúscula');
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      toast.error('La contraseña debe contener al menos un número');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    if (!formData.acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      // Call register API
      await authApi.register({
        cooperativeName: formData.cooperativeName,
        cooperativeType: formData.cooperativeType,
        name: formData.adminName,
        email: formData.email,
        password: formData.password,
      });

      toast.success('¡Cuenta creada exitosamente!');
      toast.info('Por favor inicia sesión con tus credenciales');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-primary/80">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] border border-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] border border-white/10 rounded-full"
        />

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="font-heading font-bold text-xl">ContaCoop</span>
            </Link>

            <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-6">
              Comienza a gestionar tu cooperativa hoy
            </h1>

            <p className="text-lg text-primary-foreground/80 mb-12 max-w-md">
              Únete a más de 150 cooperativas que confían en nuestra plataforma para gestionar sus finanzas.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <span className="text-lg">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background relative">
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

        <div className="w-full max-w-md relative z-10 mt-16 lg:mt-0">
          {/* Desktop: Back link */}
          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
            <p className="text-sm text-muted-foreground">
              Paso {step} de 2: {step === 1 ? 'Datos de la cooperativa' : 'Tu cuenta'}
            </p>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {step === 1 ? 'Crea tu cooperativa' : 'Configura tu cuenta'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {step === 1
                  ? 'Ingresa los datos básicos de tu cooperativa'
                  : 'Configura tus credenciales de administrador'}
              </p>
            </div>

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-5">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cooperativeName">Nombre de la Cooperativa</Label>
                    <Input
                      id="cooperativeName"
                      placeholder="Ej: Cooperativa San José"
                      value={formData.cooperativeName}
                      onChange={(e) => handleChange('cooperativeName', e.target.value)}
                      className="h-11"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cooperativeType">Tipo de Cooperativa</Label>
                    <Select
                      value={formData.cooperativeType}
                      onValueChange={(value) => handleChange('cooperativeType', value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent portal={false}>
                        {cooperativeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full h-11">
                    Continuar
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Nombre Completo</Label>
                    <Input
                      id="adminName"
                      placeholder="Tu nombre completo"
                      value={formData.adminName}
                      onChange={(e) => handleChange('adminName', e.target.value)}
                      className="h-11"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@cooperativa.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mín. 8 caracteres, mayúscula, número"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className="h-11 pr-10"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleChange('acceptTerms', checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      Acepto los{' '}
                      <a href="#" className="text-primary hover:underline">términos y condiciones</a>
                      {' '}y la{' '}
                      <a href="#" className="text-primary hover:underline">política de privacidad</a>
                    </Label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => setStep(1)}
                    >
                      Atrás
                    </Button>
                    <Button type="submit" className="flex-1 h-11" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        'Crear Cuenta'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </motion.div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
