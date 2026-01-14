import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  TrendingUp,
  PieChart,
  Upload,
  Bell,
  Shield,
  BarChart3,
  CheckCircle,
  Play,
  Star,
  ArrowRight,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
  Globe,
  Lock,
  Quote,
  Sparkles,
  Target,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HeroDashboardPreview,
  AnalyticsIllustration,
  TeamIllustration,
  FinanceIllustration,
} from '@/components/illustrations/LandingIllustrations';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// Counter animation hook
function useCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!startOnView || isInView) {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
}

// Features data with colors
const features = [
  {
    icon: BarChart3,
    title: 'Balance General',
    description: 'Visualiza activos, pasivos y patrimonio con gráficos interactivos y reportes detallados.',
    color: 'primary',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    icon: TrendingUp,
    title: 'Flujo de Caja',
    description: 'Monitorea entradas y salidas de efectivo por operaciones, inversiones y financiamiento.',
    color: 'success',
    gradient: 'from-success/20 to-success/5',
  },
  {
    icon: Users,
    title: 'Cuotas de Socios',
    description: 'Gestiona pagos, envía recordatorios automáticos y mantén el control de morosidad.',
    color: 'chart-2',
    gradient: 'from-chart-2/20 to-chart-2/5',
  },
  {
    icon: PieChart,
    title: 'Ratios Financieros',
    description: 'Analiza indicadores clave como liquidez, endeudamiento y rentabilidad.',
    color: 'accent',
    gradient: 'from-accent/20 to-accent/5',
  },
  {
    icon: Upload,
    title: 'Importación Excel',
    description: 'Carga datos fácilmente con plantillas prediseñadas en formato Excel o CSV.',
    color: 'chart-3',
    gradient: 'from-chart-3/20 to-chart-3/5',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Alertas en tiempo real para administradores y socios sobre eventos importantes.',
    color: 'chart-5',
    gradient: 'from-chart-5/20 to-chart-5/5',
  },
];

// Testimonials data
const testimonials = [
  {
    quote: 'ContaCoop nos ayudó a reducir el tiempo de gestión financiera en un 70%. Ahora podemos enfocarnos en lo que realmente importa: nuestros socios.',
    author: 'María García Rodríguez',
    role: 'Administradora',
    company: 'Cooperativa San José',
    avatar: '/images/avatar-1.jpg',
    rating: 5,
  },
  {
    quote: 'Antes usábamos hojas de Excel dispersas. Ahora todo está centralizado y podemos tomar decisiones basadas en datos reales.',
    author: 'Carlos López Mendoza',
    role: 'Tesorero',
    company: 'Cooperativa El Sol',
    avatar: '/images/avatar-2.jpg',
    rating: 5,
  },
  {
    quote: 'La función de importación de Excel es increíble. Migramos todos nuestros datos históricos en menos de una hora.',
    author: 'Ana Martínez Vega',
    role: 'Contadora',
    company: 'Cooperativa Unidos',
    avatar: '/images/avatar-3.jpg',
    rating: 5,
  },
  {
    quote: 'El panel de control me permite ver el estado financiero de la cooperativa en segundos. Muy recomendado.',
    author: 'Roberto Sánchez',
    role: 'Presidente',
    company: 'Cooperativa Progreso',
    avatar: '/images/avatar-4.jpg',
    rating: 5,
  },
];

// Stats data
const stats = [
  { value: 150, suffix: '+', label: 'Cooperativas Activas' },
  { value: 12000, suffix: '+', label: 'Socios Gestionados' },
  { value: 5, suffix: 'M+', label: 'En Cuotas Procesadas' },
  { value: 99.9, suffix: '%', label: 'Tiempo Activo' },
];

export default function Landing() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Check system preference and localStorage for theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg text-foreground">ContaCoop</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Testimonios
              </a>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link to="/login">
                <Button>Iniciar Sesión</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-sm text-muted-foreground hover:text-foreground">
                Características
              </a>
              <a href="#demo" className="block py-2 text-sm text-muted-foreground hover:text-foreground">
                Demo
              </a>
              <a href="#testimonials" className="block py-2 text-sm text-muted-foreground hover:text-foreground">
                Testimonios
              </a>
              <div className="pt-3 border-t border-border">
                <Link to="/login" className="block">
                  <Button className="w-full">Iniciar Sesión</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-background/85 dark:bg-background/90" />
        </div>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl"
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center lg:text-left">
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-4 px-4 py-1.5">
                  <Zap className="h-3 w-3 mr-1" />
                  Nuevo: Importación automática de Excel
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Gestión Financiera para{' '}
                <span className="text-primary">Cooperativas</span>{' '}
                Modernas
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Controla cuotas de socios, visualiza estados financieros y toma decisiones informadas con datos en tiempo real. Todo en una plataforma simple y segura.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base">
                    Iniciar Sesión
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base">
                    <Play className="h-4 w-4" />
                    Ver Demo
                  </Button>
                </a>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Sin tarjeta de crédito
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Soporte en español
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Datos 100% seguros
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <HeroDashboardPreview />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const { count, ref } = useCounter(stat.value);
              return (
                <motion.div
                  key={index}
                  ref={ref}
                  variants={scaleIn}
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-primary">
                    {stat.value >= 1000 ? `${(count / 1000).toFixed(count >= stat.value ? 0 : 1)}K` : count}
                    {stat.suffix}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Características</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Todo lo que necesitas para gestionar tu cooperativa
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para cooperativas, con la simplicidad que necesitas y la potencia que exiges.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className={cn(
                  "h-full transition-all duration-500 hover:-translate-y-2 group cursor-pointer",
                  "bg-gradient-to-br from-card to-card hover:shadow-xl",
                  "border border-border hover:border-primary/30",
                  "relative overflow-hidden"
                )}>
                  {/* Gradient overlay on hover */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    `bg-gradient-to-br ${feature.gradient}`
                  )} />

                  <CardHeader className="relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                      "transition-all duration-500 group-hover:scale-110",
                      feature.color === 'primary' && "bg-primary/10 group-hover:bg-primary/20",
                      feature.color === 'success' && "bg-success/10 group-hover:bg-success/20",
                      feature.color === 'chart-2' && "bg-chart-2/10 group-hover:bg-chart-2/20",
                      feature.color === 'accent' && "bg-accent/10 group-hover:bg-accent/20",
                      feature.color === 'chart-3' && "bg-chart-3/10 group-hover:bg-chart-3/20",
                      feature.color === 'chart-5' && "bg-chart-5/10 group-hover:bg-chart-5/20",
                    )}>
                      <feature.icon className={cn(
                        "h-7 w-7 transition-colors duration-300",
                        feature.color === 'primary' && "text-primary",
                        feature.color === 'success' && "text-success",
                        feature.color === 'chart-2' && "text-chart-2",
                        feature.color === 'accent' && "text-accent",
                        feature.color === 'chart-3' && "text-chart-3",
                        feature.color === 'chart-5' && "text-chart-5",
                      )} />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>

                  {/* Corner accent */}
                  <div className={cn(
                    "absolute -bottom-2 -right-2 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500",
                    feature.color === 'primary' && "bg-primary",
                    feature.color === 'success' && "bg-success",
                    feature.color === 'chart-2' && "bg-chart-2",
                    feature.color === 'accent' && "bg-accent",
                    feature.color === 'chart-3' && "bg-chart-3",
                    feature.color === 'chart-5' && "bg-chart-5",
                  )} />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Visual Feature Showcase */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Feature 1 - Analytics */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center mb-24"
          >
            <motion.div variants={fadeInUp} className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border group">
                <img
                  src="/images/dashboard-analytics.jpg"
                  alt="Panel de Control Financiero"
                  className="w-full h-auto object-cover aspect-video transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay with theme color */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 pointer-events-none" />
                {/* Floating stat card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-4 right-4 bg-card/95 backdrop-blur rounded-xl p-3 shadow-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Crecimiento</p>
                      <p className="text-sm font-bold text-success">+24.5%</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4">Panel Inteligente</Badge>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Visualiza el estado financiero en segundos
              </h3>
              <p className="text-muted-foreground mb-6">
                Un panel de control diseñado para darte la información que necesitas al instante.
              </p>
              <ul className="space-y-3">
                {['KPIs en tiempo real', 'Gráficos interactivos', 'Tendencias históricas', 'Alertas automáticas'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-4">Gestión de Socios</Badge>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Control total de cuotas y pagos
              </h3>
              <p className="text-muted-foreground mb-6">
                Mantén un registro completo de las cuotas de cada socio con estados de pago claros.
              </p>
              <ul className="space-y-3">
                {['Estado de pago por socio', 'Filtros por estado y fecha', 'Exportación a Excel', 'Historial completo de pagos'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border group">
                <img
                  src="/images/team-meeting.jpg"
                  alt="Equipo de Trabajo Colaborativo"
                  className="w-full h-auto object-cover aspect-video transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay with theme color */}
                <div className="absolute inset-0 bg-gradient-to-bl from-chart-2/20 via-transparent to-primary/10 pointer-events-none" />
                {/* Floating user card */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 left-4 bg-card/95 backdrop-blur rounded-xl p-3 shadow-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Socios al día</p>
                      <p className="text-sm font-bold text-primary">89%</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature 3 - Finance */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center mt-24"
          >
            <motion.div variants={fadeInUp} className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border group">
                <img
                  src="/images/finance-chart.jpg"
                  alt="Análisis Financiero"
                  className="w-full h-auto object-cover aspect-video transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay with theme color */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-success/10 pointer-events-none" />
                {/* Floating chart card */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-xl p-3 shadow-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Ratio corriente</p>
                      <p className="text-sm font-bold text-accent">1.85</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4">Análisis Avanzado</Badge>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Ratios financieros en un vistazo
              </h3>
              <p className="text-muted-foreground mb-6">
                Evalúa la salud financiera de tu cooperativa con indicadores clave calculados automáticamente.
              </p>
              <ul className="space-y-3">
                {['Liquidez y solvencia', 'Rentabilidad sobre patrimonio', 'Margen operativo', 'Comparativas históricas'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/steps-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/90 dark:bg-background/95" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Cómo Funciona</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Comienza en 3 simples pasos
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            {/* Connection line */}
            <div className="hidden lg:block absolute top-24 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Building2, title: 'Registra tu Cooperativa', desc: 'Configura socios, roles administrativos y períodos financieros.' },
                { icon: Upload, title: 'Carga tus Datos', desc: 'Importa información desde Excel usando nuestras plantillas prediseñadas.' },
                { icon: BarChart3, title: 'Visualiza y Analiza', desc: 'Accede a reportes, gráficos y toma decisiones informadas.' },
              ].map((step, index) => (
                <motion.div key={index} variants={scaleIn} className="relative text-center">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                      <step.icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">Demo</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Ve ContaCoop en acción
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre cómo nuestra plataforma puede transformar la gestión financiera de tu cooperativa.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card aspect-video group">
              {/* Demo Video */}
              <video
                className="w-full h-full object-cover"
                controls
                poster="/images/dashboard-analytics.jpg"
                preload="metadata"
              >
                <source src="/videos/demo.mp4" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -z-10 -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -z-10 -bottom-4 -right-4 w-32 h-32 bg-chart-2/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/testimonial-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/90 dark:bg-background/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-primary/5" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Testimonios</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Lo que dicen nuestros usuarios
            </h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-border"
            >
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              <p className="text-xl md:text-2xl text-foreground mb-8 leading-relaxed">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].author}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonials[activeTestimonial].author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].company}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Testimonial indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all duration-300',
                    index === activeTestimonial ? 'bg-primary w-8' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/cta-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

        {/* Animated shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -right-1/4 w-96 h-96 border border-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] border border-white/10 rounded-full"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              ¿Listo para transformar la gestión de tu cooperativa?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Únete a más de 150 cooperativas que ya confían en ContaCoop para gestionar sus finanzas.
            </p>
            <div className="flex justify-center">
              <Link to="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2 text-base">
                  Iniciar Sesión
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/60">
              ¿Preguntas? Escríbenos a info@contacoop.com
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-sidebar text-sidebar-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-lg text-sidebar-foreground">ContaCoop</span>
              </div>
              <p className="text-sm text-sidebar-foreground/70 mb-4">
                Plataforma líder en gestión financiera para cooperativas en América Latina.
              </p>
              <div className="flex gap-4">
                {/* Social icons - placeholder */}
                <a href="#" className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center hover:bg-primary transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-sidebar-foreground mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/70">
                <li><a href="#features" className="hover:text-sidebar-foreground transition-colors">Características</a></li>
                <li><a href="#demo" className="hover:text-sidebar-foreground transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Actualizaciones</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-sidebar-foreground mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/70">
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Comunidad</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sidebar-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/70">
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Términos de Uso</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Seguridad</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-sidebar-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-sidebar-foreground/60">
              © {new Date().getFullYear()} ContaCoop. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-sidebar-foreground/60">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Datos encriptados
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                SSL seguro
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
