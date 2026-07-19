import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import DashboardTopNavbar from '../components/DashboardTopNavbar.jsx';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <DashboardTopNavbar onMenuToggle={() => setIsSidebarOpen(true)} />
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;

