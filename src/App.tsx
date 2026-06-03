
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
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
import TestDetailPage from '@/pages/tests/TestDetailPage'
import CreateTestPage from '@/pages/tests/CreateTestPage'
import StudentsPage from '@/pages/students'
import AnalyticsPage from '@/pages/analytics'
import CouponsPage from '@/pages/coupons'
import ChatsPage from '@/pages/chats'
import AnnouncementsPage from '@/pages/announcements'
import AnnouncementDetailPage from '@/pages/announcements/AnnouncementDetailPage'
import CreateAnnouncementPage from '@/pages/announcements/CreateAnnouncementPage'
import CreateCouponPage from '@/pages/coupons/CreateCouponPage'
import ProfilePage from '@/pages/profile'
import EditProfilePage from '@/pages/profile/EditProfilePage'
import BankDetailsAndTransaction from '@/pages/profile/BankDetails&Transaction'
import UpdateBankDetails from '@/pages/profile/UpdateBankDetails'
import FullTransactionHistory from '@/pages/profile/FullTransactionHistory'
import { useEffect } from 'react'
import { tpstreamsUploadService } from '@/services/tpstreamsUploadService'

const App = () => {

  useEffect(() => {
    tpstreamsUploadService.init()
  }, [])

  return (
    <>
      <Toaster position="top-right" richColors />
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
              <Route path="/courses/:id/edit" element={<CourseCreatePage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/courses/:id/reviews" element={<ReviewPage />} />
              <Route path="/courses/:id/analytics" element={<CourseAnalyticsPage />} />
              <Route path="/bundles" element={<BundlesPage />} />
              <Route path="/bundles/create" element={<CreateBundlePage />} />
              <Route path="/bundles/:id/edit" element={<CreateBundlePage />} />
              <Route path="/tests" element={<TestsPage />} />
              <Route path="/tests/create" element={<CreateTestPage />} />
              <Route path="/tests/:id/edit" element={<CreateTestPage />} />
              <Route path="/tests/:id/analytics" element={<TestDetailPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/coupon-management" element={<CouponsPage />} />
              <Route path="/coupon-management/create" element={<CreateCouponPage />} />
              <Route path="/coupon-management/:id/edit" element={<CreateCouponPage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
              <Route path="/announcements/create" element={<CreateAnnouncementPage />} />
              <Route path="/announcements/:id/edit" element={<CreateAnnouncementPage />} />
              <Route path="/account" element={<ProfilePage />} />
              <Route path="/account/edit" element={<EditProfilePage />} />
              <Route path="/account/bank" element={<BankDetailsAndTransaction />} />
              <Route path="/account/bank/update" element={<UpdateBankDetails />} />
              <Route path="/account/bank/history" element={<FullTransactionHistory />} />
            </Route>
          </Route>

          {/* ✅ Fallback */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App