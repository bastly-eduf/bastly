import { Outlet } from 'react-router-dom';
import Footer from '../components/common/Footer';
import Header from '../components/common/Header';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
