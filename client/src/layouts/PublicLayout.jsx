import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';

export default function PublicLayout() {
  return (
    <div className="site-shell">
      <Header />
      <Outlet />
    </div>
  );
}
