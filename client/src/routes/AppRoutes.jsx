import { Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import HomePage from '../pages/public/HomePage';
import PlaceholderPage from '../pages/public/PlaceholderPage';
import NotFoundPage from '../pages/public/NotFoundPage';

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
        <Route path="/login" element={<PlaceholderPage title="Log In" noIndex />} />
        <Route path="/register" element={<PlaceholderPage title="Create Account" noIndex />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
