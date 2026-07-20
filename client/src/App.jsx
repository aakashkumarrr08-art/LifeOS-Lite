import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const TaskPage = lazy(() => import('./pages/TaskPage.jsx'));
const AttendancePage = lazy(() => import('./pages/AttendancePage.jsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'));
const StudyPlannerPage = lazy(() => import('./pages/StudyPlannerPage.jsx'));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="auth-card flex min-h-[240px] w-full max-w-xl items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/25 border-t-cyan-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Loading your workspace...</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={<TaskPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="study-planner" element={<StudyPlannerPage />} />
          <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
