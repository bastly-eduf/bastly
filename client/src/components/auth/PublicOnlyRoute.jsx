import { Navigate, Outlet } from 'react-router-dom';

import { roleHome, useAuth } from '../../context/AuthContext';

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={roleHome[user.role] || '/'} replace />;
  }

  return <Outlet />;
}
