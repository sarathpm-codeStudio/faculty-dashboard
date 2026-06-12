
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
import { useEffect, useState } from 'react'
import { tpstreamsUploadService } from '@/services/tpstreamsUploadService'
import BrandSplash from '@/components/layout/BrandSplash'
import { useAuthStore } from '@/store/authStore'

// Root entry: send logged-in users to the dashboard, everyone else to login.
const RootRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return <Navigate to={isAuthenticated ? '/dashboard' : '/auth/login'} replace />
}

const App = () => {
  // Always start with the splash visible on initial load / page reload while we
  // restore the persisted auth session, then decide where to send the user.
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    tpstreamsUploadService.init()

    // Wait until the persisted auth state has been rehydrated from storage
    // before deciding login vs. dashboard. Keep the splash up a short minimum
    // so the brand mark is actually visible.
    const minSplash = new Promise<void>((resolve) => setTimeout(resolve, 1000))
    const hydrated = useAuthStore.persist.hasHydrated()
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          const unsub = useAuthStore.persist.onFinishHydration(() => {
            unsub()
            resolve()
          })
        })

    let active = true
    Promise.all([minSplash, hydrated]).then(() => {
      if (active) setAuthReady(true)
    })
    return () => {
      active = false
    }
  }, [])

  if (!authReady) {
    return <BrandSplash />
  }

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
              <Route path="/account/bank/add-bank-details" element={<UpdateBankDetails />} />
              <Route path="/account/bank/history" element={<FullTransactionHistory />} />
            </Route>
          </Route>

          {/* ✅ Root — decide based on whether the user is logged in */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App