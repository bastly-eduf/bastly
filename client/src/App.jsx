import AppErrorBoundary from './components/common/AppErrorBoundary';
import PwaInstallPrompt from './components/pwa/PwaInstallPrompt';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <PwaInstallPrompt />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
