import { Bell, Menu, CircleDot, PanelLeft, PanelLeftClose } from 'lucide-react';

interface TopBarProps {
  breadcrumb?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobile?: () => void;
}

export default function TopBar({
  breadcrumb = 'Operations / Dashboard',
  sidebarOpen = true,
  onToggleSidebar,
  onOpenMobile,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-5 sm:px-8 lg:px-10 flex items-center justify-between shadow-xs">
      {/* Left: Sidebar Disappear / Appear Toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Mobile Toggle Button (< sm) */}
        <button
          onClick={onOpenMobile}
          className="sm:hidden p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          title="Open Navigation"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop / Tablet Appear & Disappear Toggle Button (>= sm) */}
        <button
          onClick={onToggleSidebar}
          className={`hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            sidebarOpen
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border-slate-200'
              : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-300 shadow-xs ring-2 ring-sky-200/50'
          }`}
          title={sidebarOpen ? "Click to hide sidebar menu (Expand canvas)" : "Click to show sidebar menu"}
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? (
            <>
              <PanelLeftClose className="w-4 h-4 text-slate-600" />
              <span>Hide Sidebar</span>
            </>
          ) : (
            <>
              <PanelLeft className="w-4 h-4 text-sky-600" />
              <span>Show Sidebar</span>
            </>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="text-slate-900 font-bold text-sm tracking-tight">{breadcrumb}</span>
        </div>
      </div>

      {/* Right: Operational Status, Notifications, Role */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Real Business Operational Status */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs">
          <CircleDot className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Business Online</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500" />
        </button>

        {/* User Role Tag */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="text-xs font-extrabold text-slate-900 tracking-wide uppercase">Owner Portal</div>
        </div>
      </div>
    </header>
  );
}
