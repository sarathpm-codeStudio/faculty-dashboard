
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppShell from '@/components/layout/AppShell'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AuthPage from '@/pages/auth'
import OnboardingPage from '@/pages/onboarding'
import DashboardPage from '@/pages/dashboard'
import CoursesPage from '@/pages/courses'
import CourseDetailPage from '@/pages/courses/CourseDetailPage'
import CourseCreatePage from '@/pages/courses/create'
import ReviewPage from '@/pages/courses/reviewPage'
import CourseAnalyticsPage from '@/pages/courses/analytics'
import StudentDetailPage from '@/pages/students/StudentDetailPage'
import BundlesPage from '@/pages/bundles'
import CreateBundlePage from '@/pages/bundles/CreateBundlePage'
import TestsPage from '@/pages/tests'
import StudentsPage from '@/pages/students'
import AnalyticsPage from '@/pages/analytics'
import CouponsPage from '@/pages/coupons'
import ChatsPage from '@/pages/chats'
import AnnouncementsPage from '@/pages/announcements'
import AnnouncementDetailPage from '@/pages/announcements/AnnouncementDetailPage'
import CreateAnnouncementPage from '@/pages/announcements/CreateAnnouncementPage'
import CreateCouponPage from '@/pages/coupons/CreateCouponPage'
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
              <Route path="/courses/create" element={<CourseCreatePage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/courses/:id/reviews" element={<ReviewPage />} />
              <Route path="/courses/:id/analytics" element={<CourseAnalyticsPage />} />
              <Route path="/bundles" element={<BundlesPage />} />
              <Route path="/bundles/create" element={<CreateBundlePage />} />
              <Route path="/tests" element={<TestsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/coupon-management" element={<CouponsPage />} />
              <Route path="/coupon-management/create" element={<CreateCouponPage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
              <Route path="/announcements/create" element={<CreateAnnouncementPage />} />
              <Route path="/account" element={<ProfilePage />} />
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