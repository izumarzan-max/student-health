import { Link, useLocation } from 'react-router-dom';
import { Activity, BookOpen, HeartPulse, Home, LayoutDashboard, LogOut, Menu, Moon, Nut, Sparkles, User, Users, Droplets, Smile, BarChart3, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme';

const NAV = [
  { to: '/app', label: 'Шолу', icon: LayoutDashboard, end: true },
  { to: '/app/tracker', label: 'Күнделікті күнделік', icon: Home },
  { to: '/app/sleep', label: 'Ұйқы', icon: Moon },
  { to: '/app/water', label: 'Су ішу', icon: Droplets },
  { to: '/app/activity', label: 'Белсенділік', icon: Activity },
  { to: '/app/mood', label: 'Көңіл күй', icon: Smile },
  { to: '/app/analytics', label: 'Талдау', icon: BarChart3 },
  { to: '/app/nutrition', label: 'Тамақтану', icon: Nut },
  { to: '/app/library', label: 'Денсаулық кітапханасы', icon: BookOpen },
  { to: '/app/assistant', label: 'Ақылды көмекші', icon: Sparkles },
  { to: '/app/profile', label: 'Профиль', icon: User },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (profile?.full_name || 'S')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-white sticky top-0 h-screen">
        <SidebarContent
          pathname={location.pathname}
          initials={initials}
          fullName={profile?.full_name || 'Студент'}
          onSignOut={signOut}
        />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fadeIn" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col animate-slideIn h-full">
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-primary-light text-ink-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              pathname={location.pathname}
              initials={initials}
              fullName={profile?.full_name || 'Студент'}
              onSignOut={signOut}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-line flex items-center justify-between px-4 py-3 gap-2">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-primary-light text-ink" aria-label="Мәзірді ашу">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/app" className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-ink">Студент саулығы</span>
          </Link>
          <ThemeToggle className="w-10 px-0" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  initials,
  fullName,
  onSignOut,
  onNavigate,
}: {
  pathname: string;
  initials: string;
  fullName: string;
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link to="/app" className="flex items-center gap-2.5 px-5 h-16 border-b border-line shrink-0" onClick={onNavigate}>
        <div className="h-9 w-9 rounded-xl bg-primary-dark text-white flex items-center justify-center">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display font-bold text-ink text-sm">Студент саулығы</p>
          <p className="text-[10px] text-ink-muted">Студент денсаулығы</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">Мәзір</p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active ? 'bg-primary-dark text-white shadow-soft' : 'text-ink-muted hover:text-ink hover:bg-primary-light'
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3 shrink-0">
        <ThemeToggle className="mb-2 w-full justify-start" />
        <Link to="/app/profile" onClick={onNavigate} className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-light transition">
          <div className="h-9 w-9 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">{fullName}</p>
            <p className="text-xs text-ink-muted">Профильді көру</p>
          </div>
        </Link>
        <button
          onClick={() => { onSignOut(); onNavigate?.(); }}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Шығу
        </button>
      </div>
    </>
  );
}
