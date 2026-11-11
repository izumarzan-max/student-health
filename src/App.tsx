import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { LandingLayout } from '@/layouts/LandingLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageLoader } from '@/components/ui';
import { ThemeProvider } from '@/components/theme';

import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Features from '@/pages/Features';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';

import Dashboard from '@/pages/app/Dashboard';
import DailyTracker from '@/pages/app/DailyTracker';
import SleepPage from '@/pages/app/Sleep';
import WaterPage from '@/pages/app/Water';
import ActivityPage from '@/pages/app/Activity';
import MoodPage from '@/pages/app/Mood';
import Analytics from '@/pages/app/Analytics';
import Nutrition from '@/pages/app/Nutrition';
import Library from '@/pages/app/Library';
import ArticleDetail from '@/pages/app/ArticleDetail';
import Assistant from '@/pages/app/Assistant';
import Profile from '@/pages/app/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (session) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            <Route element={<LandingLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
            </Route>

            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/signup" element={<PublicOnly><SignUp /></PublicOnly>} />
            <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />

            <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/app/tracker" element={<ProtectedRoute><DailyTracker /></ProtectedRoute>} />
            <Route path="/app/sleep" element={<ProtectedRoute><SleepPage /></ProtectedRoute>} />
            <Route path="/app/water" element={<ProtectedRoute><WaterPage /></ProtectedRoute>} />
            <Route path="/app/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
            <Route path="/app/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
            <Route path="/app/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/app/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="/app/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/app/library/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
            <Route path="/app/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
