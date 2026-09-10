import {
  lazy,
  Suspense,
} from 'react';
import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute';
import RouteLoading from '../components/common/RouteLoading';

const AdminLayout = lazy(
  () => import('../layouts/AdminLayout'),
);
const DoctorLayout = lazy(
  () => import('../layouts/DoctorLayout'),
);
const ParentLayout = lazy(
  () => import('../layouts/ParentLayout'),
);
const PublicLayout = lazy(
  () => import('../layouts/PublicLayout'),
);
const StudentLayout = lazy(
  () => import('../layouts/StudentLayout'),
);

const AccountSettingsPage = lazy(
  () =>
    import(
      '../pages/account/AccountSettingsPage'
    ),
);

const AdminCoursesPage = lazy(
  () => import('../pages/admin/AdminCoursesPage'),
);
const AdminDoctorsPage = lazy(
  () => import('../pages/admin/AdminDoctorsPage'),
);
const AdminEnrollmentsPage = lazy(
  () => import('../pages/admin/AdminEnrollmentsPage'),
);
const AdminOverviewPage = lazy(
  () => import('../pages/admin/AdminOverviewPage'),
);
const AdminRewardsPage = lazy(
  () => import('../pages/admin/AdminRewardsPage'),
);

const DoctorAssessmentsPage = lazy(
  () =>
    import('../pages/doctor/DoctorAssessmentsPage'),
);
const DoctorAttendancePage = lazy(
  () =>
    import('../pages/doctor/DoctorAttendancePage'),
);
const DoctorCourseWorkspacePage = lazy(
  () =>
    import(
      '../pages/doctor/DoctorCourseWorkspacePage'
    ),
);
const DoctorCoursesPage = lazy(
  () => import('../pages/doctor/DoctorCoursesPage'),
);
const DoctorOverviewPage = lazy(
  () => import('../pages/doctor/DoctorOverviewPage'),
);
const DoctorPerformancePage = lazy(
  () =>
    import('../pages/doctor/DoctorPerformancePage'),
);
const DoctorStudentsPage = lazy(
  () => import('../pages/doctor/DoctorStudentsPage'),
);

const ParentChildPage = lazy(
  () => import('../pages/parent/ParentChildPage'),
);
const ParentCoursePage = lazy(
  () => import('../pages/parent/ParentCoursePage'),
);
const ParentOverviewPage = lazy(
  () => import('../pages/parent/ParentOverviewPage'),
);

const AboutPage = lazy(
  () => import('../pages/public/AboutPage'),
);
const CheckEmailPage = lazy(
  () => import('../pages/public/CheckEmailPage'),
);
const ContactPage = lazy(
  () => import('../pages/public/ContactPage'),
);
const CoursePage = lazy(
  () => import('../pages/public/CoursePage'),
);
const CoursesPage = lazy(
  () => import('../pages/public/CoursesPage'),
);
const DoctorProfilePage = lazy(
  () =>
    import('../pages/public/DoctorProfilePage'),
);
const DoctorsPage = lazy(
  () => import('../pages/public/DoctorsPage'),
);
const FaqPage = lazy(
  () => import('../pages/public/FaqPage'),
);
const ForgotPasswordPage = lazy(
  () =>
    import('../pages/public/ForgotPasswordPage'),
);
const HomePage = lazy(
  () => import('../pages/public/HomePage'),
);
const InvitationPage = lazy(
  () => import('../pages/public/InvitationPage'),
);
const LoginPage = lazy(
  () => import('../pages/public/LoginPage'),
);
const NotFoundPage = lazy(
  () => import('../pages/public/NotFoundPage'),
);
const RegisterPage = lazy(
  () => import('../pages/public/RegisterPage'),
);
const ResetPasswordPage = lazy(
  () =>
    import('../pages/public/ResetPasswordPage'),
);
const VerifyEmailPage = lazy(
  () => import('../pages/public/VerifyEmailPage'),
);

const StudentAssessmentPage = lazy(
  () =>
    import('../pages/student/StudentAssessmentPage'),
);
const StudentAssessmentsPage = lazy(
  () =>
    import('../pages/student/StudentAssessmentsPage'),
);
const StudentCoursePage = lazy(
  () => import('../pages/student/StudentCoursePage'),
);
const StudentCoursesPage = lazy(
  () => import('../pages/student/StudentCoursesPage'),
);
const StudentOverviewPage = lazy(
  () =>
    import('../pages/student/StudentOverviewPage'),
);
const StudentPerformancePage = lazy(
  () =>
    import('../pages/student/StudentPerformancePage'),
);
const StudentRewardsPage = lazy(
  () => import('../pages/student/StudentRewardsPage'),
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/courses"
            element={<CoursesPage />}
          />
          <Route
            path="/courses/:slug"
            element={<CoursePage />}
          />
          <Route
            path="/doctors"
            element={<DoctorsPage />}
          />
          <Route
            path="/doctors/:slug"
            element={<DoctorProfilePage />}
          />
          <Route
            path="/about"
            element={<AboutPage />}
          />
          <Route path="/faq" element={<FaqPage />} />
          <Route
            path="/contact"
            element={<ContactPage />}
          />
        </Route>

        <Route element={<PublicOnlyRoute />}>
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/register"
            element={<RegisterPage />}
          />
        </Route>

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage />}
        />
        <Route
          path="/check-email"
          element={<CheckEmailPage />}
        />
        <Route
          path="/invite/doctor"
          element={<InvitationPage kind="doctor" />}
        />
        <Route
          path="/invite/parent"
          element={<InvitationPage kind="parent" />}
        />

        <Route
          element={
            <ProtectedRoute roles={['student']} />
          }
        >
          <Route
            path="/student"
            element={<StudentLayout />}
          >
            <Route
              index
              element={<StudentOverviewPage />}
            />
            <Route
              path="courses"
              element={<StudentCoursesPage />}
            />
            <Route
              path="courses/:courseId"
              element={<StudentCoursePage />}
            />
            <Route
              path="assessments"
              element={<StudentAssessmentsPage />}
            />
            <Route
              path="assessments/:assessmentId"
              element={<StudentAssessmentPage />}
            />
            <Route
              path="performance"
              element={<StudentPerformancePage />}
            />
            <Route
              path="rewards"
              element={<StudentRewardsPage />}
            />
            <Route
              path="settings"
              element={<AccountSettingsPage />}
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['parent']} />
          }
        >
          <Route
            path="/parent"
            element={<ParentLayout />}
          >
            <Route
              index
              element={<ParentOverviewPage />}
            />
            <Route
              path="children/:studentId"
              element={<ParentChildPage />}
            />
            <Route
              path="children/:studentId/courses/:courseId"
              element={<ParentCoursePage />}
            />
            <Route
              path="settings"
              element={<AccountSettingsPage />}
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['doctor']} />
          }
        >
          <Route
            path="/doctor"
            element={<DoctorLayout />}
          >
            <Route
              index
              element={<DoctorOverviewPage />}
            />
            <Route
              path="courses"
              element={<DoctorCoursesPage />}
            />
            <Route
              path="courses/:courseId"
              element={<DoctorCourseWorkspacePage />}
            />
            <Route
              path="courses/:courseId/assessments"
              element={<DoctorAssessmentsPage />}
            />
            <Route
              path="students"
              element={<DoctorStudentsPage />}
            />
            <Route
              path="attendance"
              element={<DoctorAttendancePage />}
            />
            <Route
              path="performance"
              element={<DoctorPerformancePage />}
            />
            <Route
              path="settings"
              element={<AccountSettingsPage />}
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['admin']} />
          }
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<AdminOverviewPage />}
            />
            <Route
              path="doctors"
              element={<AdminDoctorsPage />}
            />
            <Route
              path="courses"
              element={<AdminCoursesPage />}
            />
            <Route
              path="enrollments"
              element={<AdminEnrollmentsPage />}
            />
            <Route
              path="rewards"
              element={<AdminRewardsPage />}
            />
            <Route
              path="settings"
              element={<AccountSettingsPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
