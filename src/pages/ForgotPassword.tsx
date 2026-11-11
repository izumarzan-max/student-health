import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthShell } from './Login';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Электрондық пошта пішімін тексеріңіз.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) { setError('Қалпына келтіру сілтемесін жіберу мүмкін болмады. Электрондық поштаңызды тексеріңіз.'); return; }
    setSent(true);
  };

  return (
    <AuthShell title="Құпиясөзді қалпына келтіру" subtitle="Қалпына келтіру сілтемесін электрондық поштаңызға жібереміз.">
      {sent ? (
        <div className="text-center py-4 animate-scaleIn">
          <div className="h-14 w-14 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="font-display font-bold text-ink">Поштаңызды тексеріңіз</p>
          <p className="mt-1.5 text-sm text-ink-muted">Егер {email} мекенжайына тіркелгі байланған болса, қалпына келтіру сілтемесі жіберілді.</p>
          <Link to="/login" className="btn-secondary mt-5 inline-flex">Кіру бетіне оралу</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Электрондық пошта</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              <input type="email" className="input pl-10" placeholder="student@uni.kz" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Жіберілуде…' : <>Сілтемені жіберу <ArrowRight className="h-4 w-4" /></>}
          </button>
          <Link to="/login" className="btn-ghost w-full">
            <ArrowLeft className="h-4 w-4" /> Кіру бетіне оралу
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
