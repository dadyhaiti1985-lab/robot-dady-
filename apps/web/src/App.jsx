import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SubscriptionAuthProvider } from './contexts/SubscriptionAuthContext.jsx';
import { ThemeProvider, useThemePreference } from './contexts/ThemeContext.jsx';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import OracleTraderPro from './pages/OracleTraderPro.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import PlansPage from './pages/PlansPage.jsx';
import SubscriptionsPage from './pages/SubscriptionsPage.jsx';
import OracleTraderProDashboard from './pages/OracleTraderProDashboard.jsx';
import PremiumDashboard from './pages/PremiumDashboard.jsx';
import OracleTraderProSetup from './pages/OracleTraderProSetup.jsx';
import OracleTraderProTerminal from './pages/OracleTraderProTerminal.jsx';

function AppShell() {
  const { resolvedTheme } = useThemePreference();

  return (
    <Router>
      <AuthProvider>
        <SubscriptionAuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<OracleTraderPro />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/pricing/oracle-trader-pro" element={<PlansPage />} />

          {/* 2-step Oracle Trader Pro workflow */}
          <Route
            path="/oracle-trader-pro/setup"
            element={
              <ProtectedRoute>
                <OracleTraderProSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/oracle-trader-pro/terminal"
            element={
              <ProtectedRoute>
                <OracleTraderProTerminal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PremiumDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/oracle-trader-pro"
            element={
              <ProtectedRoute>
                <PremiumDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/trade"
            element={
              <ProtectedRoute>
                <PremiumDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/legacy"
            element={
              <ProtectedRoute>
                <OracleTraderProDashboard />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
              <div className="text-center">
                <h1 className="text-4xl font-bold font-mono-metrics mb-4 text-cyan">404_NOT_FOUND</h1>
                <p className="text-muted-foreground mb-6">Simulation dead end. Sector missing.</p>
                <a href="/dashboard" className="text-primary hover:underline">Re-initialize Terminal</a>
              </div>
            </div>
          } />
        </Routes>
        <Toaster theme={resolvedTheme} position="top-right" />
        </SubscriptionAuthProvider>
      </AuthProvider>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary label="Application">
        <AppShell />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;