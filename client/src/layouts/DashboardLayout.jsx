import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import DashboardTopNavbar from '../components/DashboardTopNavbar.jsx';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-slate-950" href="#main-content">
        Skip to main content
      </a>
      <div className="flex min-h-screen">
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <DashboardTopNavbar onMenuToggle={() => setIsSidebarOpen(true)} />
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8" id="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
