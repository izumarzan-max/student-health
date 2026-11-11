import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { AuthShell, ErrorBox } from './Login';

export default function SignUp() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Аты-жөніңізді енгізіңіз.';
    if (!email.trim()) return 'Электрондық поштаңызды енгізіңіз.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Электрондық пошта пішімін тексеріңіз.';
    if (password.length < 6) return 'Құпиясөз кемінде 6 таңбадан тұруы керек.';
    if (password !== confirm) return 'Құпиясөздер сәйкес келмейді.';
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (error) { setError(error); return; }
    toast('Тіркелгіңіз дайын — қош келдіңіз!', 'success');
    navigate('/app');
  };

  const rules = [
    { ok: fullName.trim().length > 0, label: 'Аты-жөні' },
    { ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), label: 'Электрондық пошта дұрыс' },
    { ok: password.length >= 6, label: 'Құпиясөз кемінде 6 таңба' },
    { ok: confirm.length > 0 && password === confirm, label: 'Құпиясөздер сәйкес' },
  ];

  return (
    <AuthShell title="Тіркелгі ашу" subtitle="Өзіңізге қамқорлықты бір минутта бастаңыз.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Аты-жөні</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input className="input pl-10" placeholder="Айжан Серікқызы" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
          </div>
        </div>
        <div>
          <label className="label">Электрондық пошта</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input type="email" className="input pl-10" placeholder="student@uni.kz" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
        </div>
        <div>
          <label className="label">Құпиясөз</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input type={show ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="Кемінде 6 таңба" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Құпиясөзді растау</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input type={show ? 'text' : 'password'} className="input pl-10" placeholder="Құпиясөзді қайта енгізіңіз" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-1.5 text-xs">
          {rules.map((r) => (
            <li key={r.label} className={`flex items-center gap-1.5 ${r.ok ? 'text-primary-dark' : 'text-ink-muted'}`}>
              <CheckCircle2 className="h-3.5 w-3.5" /> {r.label}
            </li>
          ))}
        </ul>

        {error && <ErrorBox message={error} />}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Тіркелгі ашылуда…' : <>Тіркелу <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Тіркелгіңіз бар ма? <Link to="/login" className="text-primary-dark font-semibold hover:underline">Кіру</Link>
      </p>
    </AuthShell>
  );
}
