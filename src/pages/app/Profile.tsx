import { useState } from 'react';
import { User as UserIcon, Mail, Globe, LogOut, Save, Pencil, HeartPulse } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { Card, SectionHeader } from '@/components/ui';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const initials = (profile?.full_name || 'С').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName, bio, language: 'kk', updated_at: new Date().toISOString() }).eq('id', user.id);
    setSaving(false);
    if (error) { toast('Профильді сақтау мүмкін болмады.', 'error'); return; }
    toast('Профиль жаңартылды.', 'success');
    setEditing(false);
    refreshProfile();
  };

  const cancel = () => {
    setFullName(profile?.full_name || '');
    setBio(profile?.bio || '');
    setEditing(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Профиль</h1>
        <p className="text-sm text-ink-muted mt-1">Жеке ақпаратыңыз бен тіркелгі баптаулары.</p>
      </div>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="h-20 w-20 rounded-2xl bg-primary-dark text-white font-display text-2xl font-bold flex items-center justify-center shrink-0">{initials}</div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-display text-xl font-bold text-ink">{profile?.full_name || 'Студент'}</h2>
            <p className="text-sm text-ink-muted mt-1 flex items-center justify-center sm:justify-start gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</p>
            {profile?.bio && <p className="text-sm text-ink-muted mt-3 max-w-md">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="chip bg-primary-light text-primary-dark"><Globe className="h-3 w-3" /> Қазақша</span>
              <span className="chip bg-cream text-ink-muted"><HeartPulse className="h-3 w-3" /> {new Date(profile?.created_at || Date.now()).toLocaleDateString('kk-KZ')} бастап</span>
            </div>
          </div>
          {!editing && <button className="btn-secondary" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Өзгерту</button>}
        </div>
      </Card>
      <Card className="p-6">
        <SectionHeader title={editing ? 'Профильді өңдеу' : 'Тіркелгі баптаулары'} subtitle={editing ? 'Жеке ақпаратыңызды жаңартыңыз' : 'Тіркелгі ақпаратыңызды қараңыз'} />
        {editing ? <div className="space-y-4">
          <div><label className="label">Аты-жөні</label><div className="relative"><UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" /><input className="input pl-10" value={fullName} onChange={(event) => setFullName(event.target.value)} /></div></div>
          <div><label className="label">Электрондық пошта (өзгертілмейді)</label><input className="input bg-cream/50 text-ink-muted" value={user?.email || ''} disabled /></div>
          <div><label className="label">Өзіңіз туралы</label><textarea className="input min-h-[80px] resize-none" placeholder="Өзіңіз туралы қысқаша жазыңыз" value={bio} onChange={(event) => setBio(event.target.value)} /></div>
          <p className="text-xs text-ink-muted">Интерфейс тілі: қазақша</p>
          <div className="flex gap-2 pt-2"><button className="btn-primary" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Сақталуда…' : 'Өзгерістерді сақтау'}</button><button className="btn-ghost" onClick={cancel}>Болдырмау</button></div>
        </div> : <div className="space-y-3">
          <Row label="Аты-жөні" value={profile?.full_name || '—'} />
          <Row label="Электрондық пошта" value={user?.email || '—'} />
          <Row label="Өзі туралы" value={profile?.bio || 'Толтырылмаған'} />
          <Row label="Тіл" value="Қазақша" />
        </div>}
      </Card>
      <Card className="p-6">
        <SectionHeader title="Құпиялық" subtitle="Деректеріңіз қорғалған" />
        <p className="text-sm text-ink-muted leading-relaxed">Денсаулық жазбаларыңыз жол деңгейінде қорғалады және тек сізге көрінеді. Басқа пайдаланушы ұйқы, су ішу, белсенділік немесе көңіл күй жазбаларыңызды көре алмайды.</p>
      </Card>
      <Card className="p-6">
        <SectionHeader title="Сеанс" />
        <button onClick={signOut} className="btn bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"><LogOut className="h-4 w-4" /> Жүйеден шығу</button>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2.5 border-b border-line last:border-0"><span className="text-sm text-ink-muted font-medium">{label}</span><span className="text-sm text-ink font-semibold sm:text-right">{value}</span></div>;
}
