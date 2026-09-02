import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Camera, 
  FileText,
  Briefcase,
  GraduationCap,
  AtSign,
  Sliders,
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  Database
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ManageLayout({ activeTab, onNavigate, onLogout, children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'works', label: 'Karya & Portofolio', icon: FolderKanban },
    { id: 'documentation', label: 'Dokumentasi BTS', icon: Camera },
    { id: 'scripts', label: 'Cuplikan Naskah', icon: FileText },
    { id: 'experience', label: 'Pengalaman Kerja', icon: Briefcase },
    { id: 'education', label: 'Riwayat Pendidikan', icon: GraduationCap },
    { id: 'contact', label: 'Informasi Kontak', icon: AtSign },
    { id: 'configs', label: 'Konfigurasi Sistem', icon: Sliders },
  ];

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'works':
        return 'Karya & Portofolio';
      case 'documentation':
        return 'Dokumentasi BTS';
      case 'scripts':
        return 'Cuplikan Naskah';
      case 'experience':
        return 'Pengalaman & Organisasi';
      case 'education':
        return 'Riwayat Pendidikan';
      case 'contact':
        return 'Informasi Kontak';
      case 'configs':
        return 'Konfigurasi Sistem & Taksonomi';
      default:
        return 'Overview Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      {/* ── TOPBAR ────────────────────────────────────────────────── */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-400 font-medium">CMS</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800">{getBreadcrumbTitle()}</span>
          </div>
        </div>

        {/* Right: Database Connection & Actions */}
        <div className="flex items-center gap-3">
          {/* Database Health Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-semibold rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MongoDB Connected</span>
          </div>

          {/* View Public Portfolio */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Website Publik</span>
            <ExternalLink size={13} className="text-slate-400" />
          </a>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            title="Keluar dari CMS"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ── SIDEBAR (Desktop Persistent & Mobile Drawer) ─────────────── */}
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <aside
          className={cn(
            "fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 md:translate-x-0",
            isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          )}
        >
          <div className="p-5 space-y-6">
            {/* Sidebar Brand Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shadow-sm">
                ZE
              </div>
              <div>
                <h1 className="font-semibold text-sm text-slate-900 leading-tight">
                  Zahara Elhusna
                </h1>
                <span className="font-mono text-[10px] text-blue-600 font-semibold tracking-wider uppercase block">
                  CMS Dashboard
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                MANAGEMENT MENU
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-3 transition-all cursor-pointer",
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer: Database summary & Admin badge */}
          <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs">
              <Database size={14} className="text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-slate-800 text-[11px] block truncate">
                  PortoZeze Database
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  MongoDB Primary
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Keluar Sesi Admin</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
