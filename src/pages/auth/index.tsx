

import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './LoginPage'
import OtpPage from './OtpPage'
import SignupPage from './SignupPage'

const AuthPage = () => {
  return (
    <Routes>
      <Route index element={<LoginPage />} />
      <Route path="otp" element={<OtpPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default AuthPage