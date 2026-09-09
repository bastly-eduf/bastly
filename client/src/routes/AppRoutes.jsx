import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute';
import AdminLayout from '../layouts/AdminLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import PublicLayout from '../layouts/PublicLayout';
import AdminCoursesPage from '../pages/admin/AdminCoursesPage';
import AdminDoctorsPage from '../pages/admin/AdminDoctorsPage';
import AdminEnrollmentsPage from '../pages/admin/AdminEnrollmentsPage';
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import RoleHomePage from '../pages/app/RoleHomePage';
import DoctorCourseWorkspacePage from '../pages/doctor/DoctorCourseWorkspacePage';
import DoctorCoursesPage from '../pages/doctor/DoctorCoursesPage';
import DoctorOverviewPage from '../pages/doctor/DoctorOverviewPage';
import DoctorStudentsPage from '../pages/doctor/DoctorStudentsPage';
import CheckEmailPage from '../pages/public/CheckEmailPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import HomePage from '../pages/public/HomePage';
import InvitationPage from '../pages/public/InvitationPage';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import PlaceholderPage from '../pages/public/PlaceholderPage';
import RegisterPage from '../pages/public/RegisterPage';
import ResetPasswordPage from '../pages/public/ResetPasswordPage';
import VerifyEmailPage from '../pages/public/VerifyEmailPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<PlaceholderPage title="Courses" />} />
        <Route path="/courses/:slug" element={<PlaceholderPage title="Course" />} />
        <Route path="/doctors" element={<PlaceholderPage title="Doctors" />} />
        <Route path="/doctors/:slug" element={<PlaceholderPage title="Doctor Profile" />} />
        <Route path="/about" element={<PlaceholderPage title="About Bastly" />} />
        <Route path="/faq" element={<PlaceholderPage title="FAQ" />} />
        <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/check-email" element={<CheckEmailPage />} />
      <Route path="/invite/doctor" element={<InvitationPage kind="doctor" />} />
      <Route path="/invite/parent" element={<InvitationPage kind="parent" />} />

      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="/student/*" element={<RoleHomePage role="Student" />} />
      </Route>

      <Route element={<ProtectedRoute roles={['parent']} />}>
        <Route path="/parent/*" element={<RoleHomePage role="Parent" />} />
      </Route>

      <Route element={<ProtectedRoute roles={['doctor']} />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorOverviewPage />} />
          <Route path="courses" element={<DoctorCoursesPage />} />
          <Route
            path="courses/:courseId"
            element={<DoctorCourseWorkspacePage />}
          />
          <Route path="students" element={<DoctorStudentsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="doctors" element={<AdminDoctorsPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
