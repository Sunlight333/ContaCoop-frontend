import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PeriodProvider } from "@/contexts/PeriodContext";
import { CooperativeProvider } from "@/contexts/CooperativeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BalanceSheet from "./pages/BalanceSheet";
import CashFlow from "./pages/CashFlow";
import MembershipFees from "./pages/MembershipFees";
import CooperativeFees from "./pages/CooperativeFees";
import FinancialRatios from "./pages/FinancialRatios";
import DataUpload from "./pages/DataUpload";
import Users from "./pages/Users";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <TooltipProvider delayDuration={0}>
          <AuthProvider>
            <CooperativeProvider>
              <PeriodProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/balance-sheet" element={<BalanceSheet />} />
                  <Route path="/cash-flow" element={<CashFlow />} />
                  <Route path="/membership-fees" element={<MembershipFees />} />
                  <Route path="/cooperative-fees" element={<CooperativeFees />} />
                  <Route path="/financial-ratios" element={<FinancialRatios />} />
                  <Route path="/upload" element={<DataUpload />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ScrollToTop />
              </PeriodProvider>
            </CooperativeProvider>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
