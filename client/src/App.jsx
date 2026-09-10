import PwaInstallPrompt from './components/pwa/PwaInstallPrompt';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <PwaInstallPrompt />
    </AuthProvider>
  );
}
