
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppShell from '@/components/layout/AppShell'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AuthPage from '@/pages/auth'
import OnboardingPage from '@/pages/onboarding'
import DashboardPage from '@/pages/dashboard'
import CoursesPage from '@/pages/courses'
import CourseDetailPage from '@/pages/courses/CourseDetailPage'
import ReviewPage from '@/pages/courses/reviewPage'
import BundlesPage from '@/pages/bundles'
import TestsPage from '@/pages/tests'
import StudentsPage from '@/pages/students'
import AnalyticsPage from '@/pages/analytics'
import FinancePage from '@/pages/finance'
import ChatsPage from '@/pages/chats'
import AnnouncementsPage from '@/pages/announcements'
import ProfilePage from '@/pages/profile'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* ✅ Public — no login needed */}
          <Route path="/auth/*" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* ✅ Protected — must be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/courses/:id/reviews" element={<ReviewPage />} />
              <Route path="/bundles" element={<BundlesPage />} />
              <Route path="/tests" element={<TestsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ✅ Fallback */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App