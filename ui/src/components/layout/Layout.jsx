import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;


