import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ThemeToggle } from '@/components/theme';

export default function Login() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Электрондық поштаңыз бен құпиясөзіңізді енгізіңіз.');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    toast('Қайта қош келдіңіз!', 'success');
    navigate('/app');
  };

  return (
    <AuthShell title="Қайта қош келдіңіз" subtitle="Жеке саулық көрсеткіштеріңізді көру үшін жүйеге кіріңіз.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Электрондық пошта</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="email"
              className="input pl-10"
              placeholder="student@uni.kz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label">Құпиясөз</label>
            <Link to="/forgot-password" className="text-xs text-primary-dark hover:underline">Ұмыттыңыз ба?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type={show ? 'text' : 'password'}
              className="input pl-10 pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Кіру…' : <>Кіру <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Тіркелгіңіз жоқ па? <Link to="/signup" className="text-primary-dark font-semibold hover:underline">Тіркелу</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="flex items-center justify-between gap-3 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-primary-dark text-white flex items-center justify-center"><HeartPulse className="h-5 w-5" /></div>
              <div className="leading-tight"><p className="font-display font-bold text-ink">Студент саулығы</p><p className="text-[10px] text-ink-muted -mt-0.5">Күнделікті өзіңе қамқорлық</p></div>
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1.5 text-ink-muted text-sm">{subtitle}</p>
          <div className="card mt-6 p-6 sm:p-7">{children}</div>
        </div>
      </div>
      <div className="hidden lg:block relative bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="relative h-full flex flex-col justify-center p-12 text-white">
          <p className="font-display text-3xl font-bold leading-tight text-balance">Ұйқы, су ішу, белсенділік пен көңіл күйді бір ыңғайлы жерден бақылаңыз.</p>
          <p className="mt-4 text-white/70 max-w-md">Студенттерге арналып жасалған. Жазбаларыңыз жеке сақталып, талдауыңыз нақты деректерге негізделеді.</p>
          <div className="mt-8 space-y-3 text-white/80 text-sm">
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-white/60" /> Апта мен ай көрсеткіштерін салыстыру</p>
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-white/60" /> Тамақтану мен денсаулық туралы кітапхана</p>
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-white/60" /> Ақылды денсаулық көмекшісі</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 animate-scaleIn">
      {message}
    </div>
  );
}
