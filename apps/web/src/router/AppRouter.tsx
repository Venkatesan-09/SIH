import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Role } from '@skilltwin/types';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { EmployeeLayout } from '../layouts/EmployeeLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Auth screens
import { LandingPage } from '../pages/auth/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';

// Employee screens
import { DashboardPage } from '../pages/employee/DashboardPage';
import { SkillGapsPage } from '../pages/employee/SkillGapsPage';
import { SkillDetailPage } from '../pages/employee/SkillDetailPage';
import { RadarPage } from '../pages/employee/RadarPage';
import { AssessmentCenterPage } from '../pages/employee/AssessmentCenterPage';
import { AssessmentAttemptPage } from '../pages/employee/AssessmentAttemptPage';
import { AssessmentResultsPage } from '../pages/employee/AssessmentResultsPage';
import { CoursesPage } from '../pages/employee/CoursesPage';
import { CourseDetailPage } from '../pages/employee/CourseDetailPage';
import { LearningPathDetailPage } from '../pages/employee/LearningPathDetailPage';
import { AIStudioPage } from '../pages/employee/AIStudioPage';
import { AITutorPage } from '../pages/employee/AITutorPage';
import { ProgressPage } from '../pages/employee/ProgressPage';
import { SettingsPage } from '../pages/employee/SettingsPage';

// Admin screens
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { HeatmapPage } from '../pages/admin/HeatmapPage';
import { EmployeeManagementPage } from '../pages/admin/EmployeeManagementPage';
import { DepartmentAnalyticsPage } from '../pages/admin/DepartmentAnalyticsPage';
import { AIInsightsPage } from '../pages/admin/AIInsightsPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { IGOTIntegrationPage } from '../pages/admin/IGOTIntegrationPage';
import { ManagementActionsPage } from '../pages/admin/ManagementActionsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== Role.ADMIN) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === Role.ADMIN ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<GuestOnly><LandingPage /></GuestOnly>} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      </Route>

      {/* Onboarding Workflow (auth required, full wizard shell) */}
      <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
      <Route path="/onboarding/profile" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
      <Route path="/onboarding/role" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
      <Route path="/onboarding/assessment" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
      <Route path="/skilltwin" element={<RequireAuth><OnboardingPage /></RequireAuth>} />

      {/* Employee routes */}
      <Route element={<RequireAuth><EmployeeLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/skill-gaps" element={<SkillGapsPage />} />
        <Route path="/skills/:skillId" element={<SkillDetailPage />} />
        <Route path="/skill-twin/radar" element={<RadarPage />} />
        <Route path="/assessments" element={<AssessmentCenterPage />} />
        <Route path="/assessments/:id/attempt" element={<AssessmentAttemptPage />} />
        <Route path="/assessments/:id/results" element={<AssessmentResultsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/learning-paths/:id" element={<LearningPathDetailPage />} />
        <Route path="/ai-studio/generate-quiz" element={<AIStudioPage />} />
        <Route path="/ai-studio/tutor" element={<AITutorPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/heatmap" element={<HeatmapPage />} />
        <Route path="/admin/employees" element={<EmployeeManagementPage />} />
        <Route path="/admin/analytics/departments" element={<DepartmentAnalyticsPage />} />
        <Route path="/admin/ai-insights" element={<AIInsightsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/actions" element={<ManagementActionsPage />} />
        <Route path="/admin/integrations/igot" element={<IGOTIntegrationPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
