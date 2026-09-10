import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute';
import AdminLayout from '../layouts/AdminLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import ParentLayout from '../layouts/ParentLayout';
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';

import AdminCoursesPage from '../pages/admin/AdminCoursesPage';
import AdminDoctorsPage from '../pages/admin/AdminDoctorsPage';
import AdminEnrollmentsPage from '../pages/admin/AdminEnrollmentsPage';
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import AdminRewardsPage from '../pages/admin/AdminRewardsPage';

import DoctorAssessmentsPage from '../pages/doctor/DoctorAssessmentsPage';
import DoctorAttendancePage from '../pages/doctor/DoctorAttendancePage';
import DoctorCourseWorkspacePage from '../pages/doctor/DoctorCourseWorkspacePage';
import DoctorCoursesPage from '../pages/doctor/DoctorCoursesPage';
import DoctorOverviewPage from '../pages/doctor/DoctorOverviewPage';
import DoctorPerformancePage from '../pages/doctor/DoctorPerformancePage';
import DoctorStudentsPage from '../pages/doctor/DoctorStudentsPage';

import ParentChildPage from '../pages/parent/ParentChildPage';
import ParentCoursePage from '../pages/parent/ParentCoursePage';
import ParentOverviewPage from '../pages/parent/ParentOverviewPage';

import CheckEmailPage from '../pages/public/CheckEmailPage';
import CoursePage from '../pages/public/CoursePage';
import CoursesPage from '../pages/public/CoursesPage';
import DoctorProfilePage from '../pages/public/DoctorProfilePage';
import DoctorsPage from '../pages/public/DoctorsPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import HomePage from '../pages/public/HomePage';
import InvitationPage from '../pages/public/InvitationPage';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import PlaceholderPage from '../pages/public/PlaceholderPage';
import RegisterPage from '../pages/public/RegisterPage';
import ResetPasswordPage from '../pages/public/ResetPasswordPage';
import VerifyEmailPage from '../pages/public/VerifyEmailPage';

import StudentAssessmentPage from '../pages/student/StudentAssessmentPage';
import StudentCoursePage from '../pages/student/StudentCoursePage';
import StudentCoursesPage from '../pages/student/StudentCoursesPage';
import StudentAssessmentsPage from '../pages/student/StudentAssessmentsPage';
import StudentOverviewPage from '../pages/student/StudentOverviewPage';
import StudentPerformancePage from '../pages/student/StudentPerformancePage';
import StudentRewardsPage from '../pages/student/StudentRewardsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CoursePage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:slug" element={<DoctorProfilePage />} />
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
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentOverviewPage />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="courses/:courseId" element={<StudentCoursePage />} />
          <Route path="assessments" element={<StudentAssessmentsPage />} />
          <Route path="assessments/:assessmentId" element={<StudentAssessmentPage />} />
          <Route path="performance" element={<StudentPerformancePage />} />
          <Route path="rewards" element={<StudentRewardsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['parent']} />}>
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<ParentOverviewPage />} />
          <Route path="children/:studentId" element={<ParentChildPage />} />
          <Route
            path="children/:studentId/courses/:courseId"
            element={<ParentCoursePage />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['doctor']} />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorOverviewPage />} />
          <Route path="courses" element={<DoctorCoursesPage />} />
          <Route path="courses/:courseId" element={<DoctorCourseWorkspacePage />} />
          <Route path="courses/:courseId/assessments" element={<DoctorAssessmentsPage />} />
          <Route path="students" element={<DoctorStudentsPage />} />
          <Route path="attendance" element={<DoctorAttendancePage />} />
          <Route path="performance" element={<DoctorPerformancePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="doctors" element={<AdminDoctorsPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="rewards" element={<AdminRewardsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
