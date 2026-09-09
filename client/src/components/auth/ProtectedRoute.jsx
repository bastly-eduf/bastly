import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { roleHome, useAuth } from '../../context/AuthContext';

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-bastly-blue-pale">
      <div className="grid place-items-center gap-4">
        <img
          src="/brand/bastly-logo.webp"
          alt="Bastly Academy"
          className="size-16 rounded-2xl bg-white object-contain shadow-soft"
        />
        <div className="size-7 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" />
      </div>
    </main>
  );
}

export default function ProtectedRoute({ roles = [] }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || '/'} replace />;
  }

  return <Outlet />;
}
