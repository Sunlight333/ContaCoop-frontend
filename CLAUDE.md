# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server on port 8080
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture

This is a cooperative financial management platform built with Vite + React + TypeScript + shadcn/ui + Tailwind CSS.

### Tech Stack
- **Build**: Vite with SWC for React
- **UI**: shadcn/ui components (in `src/components/ui/`) with Radix primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State**: React Query for server state, React Context for auth/period
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Project Structure
- `src/pages/` - Route pages (Dashboard, BalanceSheet, CashFlow, MembershipFees, FinancialRatios, DataUpload, Users, Settings, Profile, Login)
- `src/components/layout/` - AppLayout, AppHeader, AppSidebar (authenticated shell)
- `src/components/ui/` - shadcn/ui components
- `src/contexts/` - AuthContext (mock auth with roles), PeriodContext (financial period selector)
- `src/data/mockData.ts` - Mock data for all financial entities
- `src/lib/utils.ts` - `cn()` utility for class merging

### Key Patterns

**Import Alias**: Use `@/` for `src/` imports (configured in tsconfig.json and vite.config.ts)

**Layout**: All authenticated pages use `AppLayout` wrapper which handles auth checks and provides consistent layout with sidebar/header

**Roles**: Two roles exist - `admin` and `socio`. Use `requireAdmin` prop on AppLayout or check `isAdmin` from `useAuth()` for admin-only features

**Period Context**: Financial data is period-scoped. Use `usePeriod()` to get `selectedPeriod` and `formatPeriod()`

**CSS Variables**: Theme colors use HSL CSS custom properties (e.g., `hsl(var(--primary))`). Extended with `financial`, `chart`, and `sidebar` color tokens in tailwind.config.ts

**Mock Auth Credentials**:
- Admin: admin@cooperative.com / admin123
- Socio: socio@cooperative.com / socio123
