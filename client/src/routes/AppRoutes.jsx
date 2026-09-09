import { Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import RoleHomePage from '../pages/app/RoleHomePage';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import PlaceholderPage from '../pages/public/PlaceholderPage';
import RegisterPage from '../pages/public/RegisterPage';

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

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/student" element={<RoleHomePage role="Student" />} />
      <Route path="/parent" element={<RoleHomePage role="Parent" />} />
      <Route path="/doctor" element={<RoleHomePage role="Doctor" />} />
      <Route path="/admin" element={<RoleHomePage role="Admin" />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
