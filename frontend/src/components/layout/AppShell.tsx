import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
}

export default function AppShell({ children, breadcrumb }: AppShellProps) {
  // Desktop sidebar collapse/expand state (persisted in localStorage)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('owner_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('owner_sidebar_open', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex w-full overflow-x-hidden">
      {/* Sidebar Component (In-Flow Desktop Sibling + Mobile Drawer) */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area - In natural flex flow adjacent to sidebar, NEVER cut off! */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <TopBar
          breadcrumb={breadcrumb}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-6 sm:p-10 lg:p-12 xl:p-14 w-full mx-auto max-w-[1680px]">
          {children}
        </main>
      </div>
    </div>
  );
}
