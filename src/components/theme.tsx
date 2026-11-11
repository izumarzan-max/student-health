import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return window.localStorage.getItem('student-health-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111915' : '#f6f8f5');
    try {
      window.localStorage.setItem('student-health-theme', theme);
    } catch {
      return;
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeToggle must be used inside ThemeProvider');
  const isDark = context.theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={context.toggleTheme}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      aria-label={isDark ? 'Жарық режимін қосу' : 'Қараңғы режимді қосу'}
      title={isDark ? 'Жарық режимі' : 'Қараңғы режим'}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{isDark ? 'Жарық режимі' : 'Қараңғы режим'}</span>
    </button>
  );
}
