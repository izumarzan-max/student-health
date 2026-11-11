import { Link, Outlet, useLocation } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme';

export function LandingLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = [
    { to: '/', label: 'Басты бет' },
    { to: '/about', label: 'Біз туралы' },
    { to: '/features', label: 'Мүмкіндіктер' },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Студент саулығы — басты бет">
            <div className="h-9 w-9 rounded-xl bg-primary-dark text-white flex items-center justify-center"><HeartPulse className="h-5 w-5" /></div>
            <div className="leading-tight"><p className="font-display font-bold text-ink">Студент саулығы</p><p className="text-[10px] text-ink-muted -mt-0.5">Күнделікті өзіңе қамқорлық</p></div>
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="Негізгі навигация">
            {links.map((link) => <Link key={link.to} to={link.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${location.pathname === link.to ? 'text-primary-dark bg-primary-light' : 'text-ink-muted hover:text-ink hover:bg-primary-light/60'}`}>{link.label}</Link>)}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="btn-ghost">Кіру</Link>
            <Link to="/signup" className="btn-primary">Тіркелу</Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle className="w-10 px-0" />
            <button className="p-2 rounded-lg hover:bg-primary-light text-ink" onClick={() => setOpen(!open)} aria-label={open ? 'Мәзірді жабу' : 'Мәзірді ашу'} aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && <div className="md:hidden border-t border-line bg-card animate-fadeIn"><div className="px-4 py-3 flex flex-col gap-1">
          {links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-primary-light">{link.label}</Link>)}
          <div className="h-px bg-line my-2" />
          <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-primary-light">Кіру</Link>
          <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary mt-1">Тіркелу</Link>
        </div></div>}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2"><div className="flex items-center gap-2.5 mb-3"><div className="h-9 w-9 rounded-xl bg-primary-dark text-white flex items-center justify-center"><HeartPulse className="h-5 w-5" /></div><p className="font-display font-bold text-ink">Студент саулығы</p></div>
            <p className="text-sm text-ink-muted max-w-md leading-relaxed">Студенттерге арналған күнделікті денсаулық әдеттерін бақылау, нәтижелерді талдау және пайдалы ақпаратты оқу платформасы.</p>
            <p className="text-xs text-ink-muted mt-4">Ақпарат жалпы саулыққа арналған және дәрігер кеңесін алмастырмайды.</p>
          </div>
          <div><p className="text-sm font-semibold text-ink mb-3">Платформа</p><ul className="space-y-2 text-sm text-ink-muted"><li><Link to="/features" className="hover:text-primary-dark">Мүмкіндіктер</Link></li><li><Link to="/about" className="hover:text-primary-dark">Біз туралы</Link></li><li><Link to="/signup" className="hover:text-primary-dark">Бастау</Link></li></ul></div>
          <div><p className="text-sm font-semibold text-ink mb-3">Тіркелгі</p><ul className="space-y-2 text-sm text-ink-muted"><li><Link to="/login" className="hover:text-primary-dark">Кіру</Link></li><li><Link to="/signup" className="hover:text-primary-dark">Тіркелу</Link></li><li><Link to="/forgot-password" className="hover:text-primary-dark">Құпиясөзді ұмыттыңыз ба?</Link></li></ul></div>
        </div>
        <div className="border-t border-line py-5 px-4 text-center text-xs text-ink-muted">© {new Date().getFullYear()} Студент саулығы · Барлық құқық қорғалған</div>
      </footer>
    </div>
  );
}
