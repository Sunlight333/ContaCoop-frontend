import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Dashboard Illustration - Hero Section
export function DashboardIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Card */}
      <rect x="50" y="50" width="700" height="500" rx="20" className="fill-card stroke-border" strokeWidth="2" />

      {/* Header Bar */}
      <rect x="50" y="50" width="700" height="60" rx="20" className="fill-muted" />
      <rect x="50" y="90" width="700" height="20" className="fill-muted" />

      {/* Logo placeholder */}
      <circle cx="90" cy="80" r="15" className="fill-primary" />

      {/* Nav items */}
      <rect x="130" y="72" width="60" height="16" rx="4" className="fill-muted-foreground/20" />
      <rect x="210" y="72" width="60" height="16" rx="4" className="fill-muted-foreground/20" />
      <rect x="290" y="72" width="60" height="16" rx="4" className="fill-muted-foreground/20" />

      {/* User avatar */}
      <circle cx="710" cy="80" r="18" className="fill-primary/20" />

      {/* Sidebar */}
      <rect x="50" y="110" width="180" height="440" className="fill-sidebar" />

      {/* Sidebar items */}
      <rect x="70" y="140" width="140" height="36" rx="8" className="fill-sidebar-primary/20" />
      <rect x="86" y="152" width="12" height="12" rx="2" className="fill-sidebar-primary" />
      <rect x="106" y="152" width="80" height="12" rx="2" className="fill-sidebar-foreground/60" />

      <rect x="70" y="190" width="140" height="36" rx="8" className="fill-transparent" />
      <rect x="86" y="202" width="12" height="12" rx="2" className="fill-sidebar-foreground/40" />
      <rect x="106" y="202" width="70" height="12" rx="2" className="fill-sidebar-foreground/40" />

      <rect x="70" y="240" width="140" height="36" rx="8" className="fill-transparent" />
      <rect x="86" y="252" width="12" height="12" rx="2" className="fill-sidebar-foreground/40" />
      <rect x="106" y="252" width="90" height="12" rx="2" className="fill-sidebar-foreground/40" />

      <rect x="70" y="290" width="140" height="36" rx="8" className="fill-transparent" />
      <rect x="86" y="302" width="12" height="12" rx="2" className="fill-sidebar-foreground/40" />
      <rect x="106" y="302" width="60" height="12" rx="2" className="fill-sidebar-foreground/40" />

      {/* Main Content Area */}
      {/* KPI Cards Row */}
      <g>
        {/* KPI Card 1 */}
        <rect x="250" y="130" width="150" height="90" rx="12" className="fill-card stroke-border" strokeWidth="1" />
        <rect x="270" y="150" width="80" height="12" rx="2" className="fill-muted-foreground/30" />
        <rect x="270" y="175" width="100" height="24" rx="4" className="fill-primary/20" />
        <text x="275" y="193" className="fill-primary text-sm font-bold">$125,400</text>

        {/* KPI Card 2 */}
        <rect x="420" y="130" width="150" height="90" rx="12" className="fill-card stroke-border" strokeWidth="1" />
        <rect x="440" y="150" width="70" height="12" rx="2" className="fill-muted-foreground/30" />
        <rect x="440" y="175" width="90" height="24" rx="4" className="fill-success/20" />
        <text x="445" y="193" className="fill-success text-sm font-bold">+23.5%</text>

        {/* KPI Card 3 */}
        <rect x="590" y="130" width="140" height="90" rx="12" className="fill-card stroke-border" strokeWidth="1" />
        <rect x="610" y="150" width="60" height="12" rx="2" className="fill-muted-foreground/30" />
        <rect x="610" y="175" width="80" height="24" rx="4" className="fill-chart-2/20" />
        <text x="615" y="193" className="fill-chart-2 text-sm font-bold">1,234</text>
      </g>

      {/* Chart Area */}
      <rect x="250" y="240" width="310" height="200" rx="12" className="fill-card stroke-border" strokeWidth="1" />
      <rect x="270" y="260" width="100" height="14" rx="2" className="fill-foreground/80" />
      <rect x="270" y="280" width="150" height="10" rx="2" className="fill-muted-foreground/30" />

      {/* Bar Chart */}
      <g transform="translate(270, 310)">
        <rect x="0" y="80" width="30" height="60" rx="4" className="fill-primary/60" />
        <rect x="45" y="50" width="30" height="90" rx="4" className="fill-primary/80" />
        <rect x="90" y="30" width="30" height="110" rx="4" className="fill-primary" />
        <rect x="135" y="60" width="30" height="80" rx="4" className="fill-primary/70" />
        <rect x="180" y="20" width="30" height="120" rx="4" className="fill-primary" />
        <rect x="225" y="40" width="30" height="100" rx="4" className="fill-primary/80" />
      </g>

      {/* Side Panel */}
      <rect x="580" y="240" width="150" height="200" rx="12" className="fill-card stroke-border" strokeWidth="1" />
      <rect x="600" y="260" width="80" height="14" rx="2" className="fill-foreground/80" />

      {/* Pie Chart representation */}
      <circle cx="655" cy="350" r="50" className="fill-muted" />
      <path d="M655 300 A50 50 0 0 1 705 350 L655 350 Z" className="fill-primary" />
      <path d="M705 350 A50 50 0 0 1 655 400 L655 350 Z" className="fill-chart-2" />
      <path d="M655 400 A50 50 0 0 1 605 350 L655 350 Z" className="fill-accent" />
      <path d="M605 350 A50 50 0 0 1 655 300 L655 350 Z" className="fill-success" />

      {/* Table Section */}
      <rect x="250" y="460" width="480" height="80" rx="12" className="fill-card stroke-border" strokeWidth="1" />
      <rect x="270" y="480" width="440" height="12" rx="2" className="fill-muted" />
      <rect x="270" y="502" width="440" height="1" className="fill-border" />
      <rect x="270" y="515" width="100" height="10" rx="2" className="fill-muted-foreground/30" />
      <rect x="400" y="515" width="80" height="10" rx="2" className="fill-muted-foreground/30" />
      <rect x="520" y="515" width="60" height="10" rx="2" className="fill-success/50" />
      <rect x="620" y="515" width="90" height="10" rx="2" className="fill-muted-foreground/30" />
    </svg>
  );
}

// Analytics Illustration - Feature Section
export function AnalyticsIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Elements */}
      <circle cx="400" cy="100" r="80" className="fill-primary/5" />
      <circle cx="80" cy="320" r="60" className="fill-accent/5" />

      {/* Main Card */}
      <rect x="50" y="50" width="400" height="300" rx="16" className="fill-card stroke-border" strokeWidth="2" />

      {/* Header */}
      <rect x="70" y="70" width="120" height="16" rx="4" className="fill-foreground/80" />
      <rect x="70" y="95" width="200" height="10" rx="2" className="fill-muted-foreground/40" />

      {/* Large Line Chart */}
      <g transform="translate(70, 130)">
        {/* Grid lines */}
        <line x1="0" y1="0" x2="360" y2="0" className="stroke-border" strokeWidth="1" />
        <line x1="0" y1="50" x2="360" y2="50" className="stroke-border" strokeWidth="1" />
        <line x1="0" y1="100" x2="360" y2="100" className="stroke-border" strokeWidth="1" />
        <line x1="0" y1="150" x2="360" y2="150" className="stroke-border" strokeWidth="1" />

        {/* Chart Line 1 - Primary */}
        <motion.path
          d="M0 120 Q60 100 120 80 T240 40 T360 20"
          className="stroke-primary"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Chart Line 2 - Secondary */}
        <motion.path
          d="M0 140 Q60 130 120 110 T240 90 T360 60"
          className="stroke-chart-2"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />

        {/* Data points */}
        <circle cx="0" cy="120" r="5" className="fill-primary" />
        <circle cx="120" cy="80" r="5" className="fill-primary" />
        <circle cx="240" cy="40" r="5" className="fill-primary" />
        <circle cx="360" cy="20" r="5" className="fill-primary" />
      </g>

      {/* Legend */}
      <g transform="translate(70, 300)">
        <circle cx="8" cy="8" r="6" className="fill-primary" />
        <rect x="22" y="4" width="60" height="8" rx="2" className="fill-muted-foreground/40" />
        <circle cx="108" cy="8" r="6" className="fill-chart-2" />
        <rect x="122" y="4" width="50" height="8" rx="2" className="fill-muted-foreground/40" />
      </g>

      {/* Floating Stats Card */}
      <motion.g
        initial={{ y: 10 }}
        animate={{ y: [10, -5, 10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="320" y="60" width="120" height="60" rx="10" className="fill-card shadow-lg" filter="url(#shadow)" />
        <rect x="320" y="60" width="120" height="60" rx="10" className="stroke-success/50" strokeWidth="2" fill="none" />
        <rect x="335" y="75" width="50" height="8" rx="2" className="fill-muted-foreground/40" />
        <text x="335" y="105" className="fill-success text-lg font-bold">↑ 24%</text>
      </motion.g>

      {/* Filter for shadow */}
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="hsl(var(--foreground))" floodOpacity="0.1" />
        </filter>
      </defs>
    </svg>
  );
}

// Team/Members Illustration
export function TeamIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circles */}
      <circle cx="250" cy="200" r="150" className="fill-primary/5" />
      <circle cx="250" cy="200" r="100" className="fill-primary/5" />

      {/* Center person (larger) */}
      <g transform="translate(210, 140)">
        <circle cx="40" cy="30" r="30" className="fill-primary/20" />
        <circle cx="40" cy="25" r="18" className="fill-primary/40" />
        <path d="M10 90 Q40 70 70 90 L70 110 Q40 100 10 110 Z" className="fill-primary" />
      </g>

      {/* Left person */}
      <g transform="translate(80, 180)">
        <circle cx="35" cy="25" r="25" className="fill-chart-2/20" />
        <circle cx="35" cy="20" r="15" className="fill-chart-2/40" />
        <path d="M10 75 Q35 58 60 75 L60 92 Q35 82 10 92 Z" className="fill-chart-2" />
      </g>

      {/* Right person */}
      <g transform="translate(320, 180)">
        <circle cx="35" cy="25" r="25" className="fill-accent/20" />
        <circle cx="35" cy="20" r="15" className="fill-accent/40" />
        <path d="M10 75 Q35 58 60 75 L60 92 Q35 82 10 92 Z" className="fill-accent" />
      </g>

      {/* Connection lines */}
      <motion.line
        x1="150" y1="220" x2="210" y2="180"
        className="stroke-primary/30"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.line
        x1="290" y1="180" x2="350" y2="220"
        className="stroke-primary/30"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />

      {/* Data cards floating around */}
      <motion.g
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="60" y="100" width="80" height="50" rx="8" className="fill-card stroke-border" strokeWidth="1" />
        <rect x="72" y="115" width="40" height="6" rx="2" className="fill-muted-foreground/40" />
        <rect x="72" y="130" width="55" height="10" rx="2" className="fill-success/50" />
      </motion.g>

      <motion.g
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <rect x="360" y="110" width="80" height="50" rx="8" className="fill-card stroke-border" strokeWidth="1" />
        <rect x="372" y="125" width="45" height="6" rx="2" className="fill-muted-foreground/40" />
        <rect x="372" y="140" width="50" height="10" rx="2" className="fill-primary/50" />
      </motion.g>

      {/* Bottom text placeholder */}
      <rect x="175" y="320" width="150" height="12" rx="4" className="fill-muted-foreground/20" />
      <rect x="200" y="345" width="100" height="8" rx="2" className="fill-muted-foreground/10" />
    </svg>
  );
}

// Finance/Money Illustration
export function FinanceIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <circle cx="250" cy="200" r="180" className="fill-primary/3" />

      {/* Coin stack */}
      <g transform="translate(100, 150)">
        <ellipse cx="60" cy="150" rx="50" ry="15" className="fill-accent/60" />
        <rect x="10" y="135" width="100" height="15" className="fill-accent/60" />
        <ellipse cx="60" cy="135" rx="50" ry="15" className="fill-accent/80" />

        <ellipse cx="60" cy="120" rx="50" ry="15" className="fill-accent/60" />
        <rect x="10" y="105" width="100" height="15" className="fill-accent/60" />
        <ellipse cx="60" cy="105" rx="50" ry="15" className="fill-accent/80" />

        <ellipse cx="60" cy="90" rx="50" ry="15" className="fill-accent/60" />
        <rect x="10" y="75" width="100" height="15" className="fill-accent/60" />
        <ellipse cx="60" cy="75" rx="50" ry="15" className="fill-accent" />
        <text x="45" y="82" className="fill-accent-foreground text-lg font-bold">$</text>
      </g>

      {/* Chart going up */}
      <g transform="translate(220, 100)">
        <rect x="0" y="0" width="200" height="150" rx="12" className="fill-card stroke-border" strokeWidth="2" />

        {/* Mini chart */}
        <motion.path
          d="M20 120 L50 100 L80 110 L110 70 L140 80 L170 30"
          className="stroke-success"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Area fill */}
        <path
          d="M20 120 L50 100 L80 110 L110 70 L140 80 L170 30 L170 130 L20 130 Z"
          className="fill-success/10"
        />

        {/* Arrow up */}
        <motion.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="170" cy="30" r="15" className="fill-success" />
          <path d="M170 22 L177 35 L163 35 Z" className="fill-success-foreground" />
        </motion.g>
      </g>

      {/* Floating dollar signs */}
      <motion.g
        animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <text x="380" y="150" className="fill-primary/30 text-2xl font-bold">$</text>
      </motion.g>
      <motion.g
        animate={{ y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <text x="420" y="200" className="fill-success/30 text-xl font-bold">$</text>
      </motion.g>
      <motion.g
        animate={{ y: [0, -12, 0], opacity: [0.25, 0.7, 0.25] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <text x="70" y="120" className="fill-accent/30 text-lg font-bold">$</text>
      </motion.g>

      {/* Info cards */}
      <motion.g
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="300" y="280" width="120" height="60" rx="10" className="fill-card stroke-border" strokeWidth="1" />
        <rect x="315" y="295" width="50" height="8" rx="2" className="fill-muted-foreground/40" />
        <rect x="315" y="315" width="80" height="12" rx="3" className="fill-primary/30" />
      </motion.g>
    </svg>
  );
}

// Hero Dashboard Preview (more detailed)
export function HeroDashboardPreview({ className = '' }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Main Dashboard Frame */}
      <div className="rounded-2xl overflow-hidden border-2 border-border bg-card shadow-2xl">
        {/* Browser Chrome */}
        <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-accent/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground max-w-xs mx-auto text-center">
              app.coopfinanzas.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-14 md:w-48 bg-sidebar p-2 md:p-4 hidden sm:block">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground text-xs font-bold">CF</span>
              </div>
              <span className="hidden md:block text-sidebar-foreground text-sm font-semibold">ContaCoop</span>
            </div>

            <div className="space-y-1">
              {['Panel', 'Balance', 'Flujo', 'Cuotas', 'Ratios'].map((item, i) => (
                <div
                  key={item}
                  className={cn(
                    "px-2 md:px-3 py-2 rounded-lg text-xs",
                    i === 0 ? "bg-sidebar-primary/20 text-sidebar-primary" : "text-sidebar-foreground/60"
                  )}
                >
                  <span className="hidden md:inline">{item}</span>
                  <span className="md:hidden">{item[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 md:p-6 bg-background">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <div className="h-5 md:h-6 w-32 md:w-40 bg-foreground/80 rounded mb-1" />
              <div className="h-3 md:h-4 w-48 md:w-56 bg-muted-foreground/30 rounded" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
              {[
                { value: '$155,000', label: 'Activos', color: 'primary' },
                { value: '$320,000', label: 'Flujo', color: 'success' },
                { value: '+23%', label: 'Crecimiento', color: 'chart-2' },
                { value: '1.85', label: 'Ratio', color: 'accent' },
              ].map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-2 md:p-4 border border-border"
                >
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">{kpi.label}</div>
                  <div className={cn(
                    "text-sm md:text-xl font-bold",
                    kpi.color === 'primary' && "text-primary",
                    kpi.color === 'success' && "text-success",
                    kpi.color === 'chart-2' && "text-chart-2",
                    kpi.color === 'accent' && "text-accent"
                  )}>
                    {kpi.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-3 md:gap-4">
              {/* Bar Chart */}
              <div className="bg-card rounded-xl p-3 md:p-4 border border-border">
                <div className="h-3 md:h-4 w-24 md:w-32 bg-foreground/60 rounded mb-3 md:mb-4" />
                <div className="flex items-end gap-1 md:gap-2 h-20 md:h-32">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      className="flex-1 bg-primary rounded-t"
                    />
                  ))}
                </div>
              </div>

              {/* Line Chart placeholder */}
              <div className="bg-card rounded-xl p-3 md:p-4 border border-border hidden md:block">
                <div className="h-4 w-28 bg-foreground/60 rounded mb-4" />
                <svg className="w-full h-32" viewBox="0 0 200 100">
                  <motion.path
                    d="M0 80 Q25 70 50 60 T100 40 T150 30 T200 20"
                    fill="none"
                    className="stroke-success"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                  <motion.path
                    d="M0 90 Q25 85 50 75 T100 65 T150 55 T200 45"
                    fill="none"
                    className="stroke-chart-2"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-card rounded-xl p-3 md:p-4 shadow-xl border border-border"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Cuotas cobradas</p>
            <p className="text-xs md:text-sm font-bold text-success">+23% este mes</p>
          </div>
        </div>
      </motion.div>

      {/* Floating user card */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-card rounded-xl p-3 md:p-4 shadow-xl border border-border"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Socios activos</p>
            <p className="text-xs md:text-sm font-bold text-primary">1,234</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
