import { useState } from 'react';
import { Moon, Droplets, Activity, Smile, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useTodaySleep, useTodayWater, useTodayActivity, useTodayMood } from '@/hooks/useToday';
import { Card, SectionHeader, EmptyState } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { MOOD_META, MoodIcon } from '@/components/mood';
import { minutesToHM, todayISO, formatTime, activityTypeLabel, intensityLabel } from '@/lib/utils';
import type { MoodLevel, WaterRecord, ActivityRecord } from '@/types';

export default function DailyTracker() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Күнделікті күнделік</h1>
        <p className="text-sm text-ink-muted mt-1">Бүгінгі денсаулық көрсеткіштеріңіздің бәрін бір жерге енгізіңіз.</p>
      </div>
      <SleepSection />
      <WaterSection />
      <ActivitySection />
      <MoodSection />
    </div>
  );
}

function SleepSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { record, loading, reload } = useTodaySleep();
  const [open, setOpen] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState('23:00');
  const [end, setEnd] = useState('07:00');
  const [quality, setQuality] = useState(3);

  const computeDuration = (d: string, s: string, e: string) => {
    const start = new Date(`${d}T${s}:00`);
    let end = new Date(`${d}T${e}:00`);
    if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  };

  const save = async () => {
    if (!user) return;
    const duration = computeDuration(date, start, end);
    if (duration <= 0) { toast('Уақыттарды тексеріңіз.', 'error'); return; }
    const { error } = await supabase.from('sleep_records').upsert({
      user_id: user.id,
      sleep_date: date,
      start_time: new Date(`${date}T${start}:00`).toISOString(),
      end_time: new Date(`${date}T${end}:00`).toISOString(),
      duration_minutes: duration,
      quality,
      id: record?.id,
    });
    if (error) { toast('Жазбаны сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast('Ұйқы жазбасы сақталды.', 'success');
    setOpen(false);
    reload();
  };

  const del = async () => {
    if (!record) return;
    await supabase.from('sleep_records').delete().eq('id', record.id);
    toast('Ұйқы жазбасы өшірілді.', 'info');
    reload();
  };

  return (
    <Card className="p-5">
      <SectionHeader
        title="Ұйқы"
        subtitle={record ? `${minutesToHM(record.duration_minutes)} белгіленді` : 'Әзірге жазба жоқ'}
        action={
          <div className="flex gap-2">
            {record && <button className="btn-danger px-3 py-2" onClick={() => setShowDel(true)}><Trash2 className="h-4 w-4" /></button>}
            <button className="btn-secondary" onClick={() => { if (record) { const s = new Date(record.start_time); const e = new Date(record.end_time); setStart(s.toTimeString().slice(0, 5)); setEnd(e.toTimeString().slice(0, 5)); setQuality(record.quality); setDate(record.sleep_date); } setOpen(true); }}>
              {record ? <><Pencil className="h-4 w-4" /> Өңдеу</> : <><Plus className="h-4 w-4" /> Қосу</>}
            </button>
          </div>
        }
      />
      {loading ? null : record ? (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center"><Moon className="h-6 w-6" /></div>
          <div>
            <p className="font-display text-xl font-bold text-ink">{minutesToHM(record.duration_minutes)}</p>
            <p className="text-xs text-ink-muted">{formatTime(new Date(record.start_time))} → {formatTime(new Date(record.end_time))} · Сапасы {record.quality}/5</p>
          </div>
        </div>
      ) : (
        <EmptyState icon={<Moon className="h-6 w-6" />} title="Бүгінгі ұйқы белгіленбеген" description="Ұйқы ұзақтығын бақылау үшін ұйықтаған және оянған уақытыңызды енгізіңіз." />
      )}
      <SleepModal {...{ open, setOpen, date, setDate, start, setStart, end, setEnd, quality, setQuality, save }} />
      <ConfirmDialog open={showDel} onClose={() => setShowDel(false)} onConfirm={del} title="Ұйқы жазбасын өшіресіз бе?" message="Бүгінгі ұйқы жазбасы жойылады." />
    </Card>
  );
}

function SleepModal({ open, setOpen, date, setDate, start, setStart, end, setEnd, quality, setQuality, save }: any) {
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Ұйқыны белгілеу" footer={<><button className="btn-ghost" onClick={() => setOpen(false)}>Болдырмау</button><button className="btn-primary" onClick={save}>Сақтау</button></>}>
      <div className="space-y-4">
        <div><label className="label">Күні</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Ұйықтаған уақыт</label><input type="time" className="input" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div><label className="label">Оянған уақыт</label><input type="time" className="input" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        </div>
        <div>
          <label className="label">Sleep quality: {quality}/5</label>
          <input type="range" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-[10px] text-ink-muted mt-1"><span>Төмен</span><span>Өте жақсы</span></div>
        </div>
      </div>
    </Modal>
  );
}

function WaterSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { records, total, reload } = useTodayWater();
  const [custom, setCustom] = useState('');
  const [editing, setEditing] = useState<WaterRecord | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const quick = [150, 250, 500];

  const add = async (ml: number) => {
    if (!user) return;
    const { error } = await supabase.from('water_records').insert({ user_id: user.id, log_date: todayISO(), amount_ml: ml });
    if (error) { toast('Жазбаны сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast(`${ml} мл су қосылды.`, 'success');
    reload();
  };

  const addCustom = async () => {
    const ml = parseInt(custom);
    if (!ml || ml <= 0) { toast('Дұрыс мөлшер енгізіңіз.', 'error'); return; }
    await add(ml);
    setCustom('');
  };

  const updateRecord = async () => {
    if (!editing) return;
    const ml = parseInt(editAmount);
    if (!ml || ml <= 0) { toast('Дұрыс мөлшер енгізіңіз.', 'error'); return; }
    const { error } = await supabase.from('water_records').update({ amount_ml: ml }).eq('id', editing.id);
    if (error) { toast('Жазбаны сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast('Су мөлшері жаңартылды.', 'success');
    setEditing(null);
    reload();
  };

  const del = async () => {
    if (!delId) return;
    await supabase.from('water_records').delete().eq('id', delId);
    toast('Жазба өшірілді.', 'info');
    setDelId(null);
    reload();
  };

  const goal = 2500;
  const pct = Math.min(100, (total / goal) * 100);

  return (
    <Card className="p-5">
      <SectionHeader title="Су ішу" subtitle={`${total} мл / ${goal} мл мақсат`} />
      <div className="flex flex-col sm:flex-row gap-5 items-stretch">
        <div className="flex items-center justify-center">
          <div className="relative h-32 w-32">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E6EFE5" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#789B7D" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 264} 264`} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-bold text-ink">{Math.round(pct)}%</p>
              <p className="text-[10px] text-ink-muted">мақсат</p>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            {quick.map((ml) => (
              <button key={ml} onClick={() => add(ml)} className="btn-secondary px-4 py-2.5 flex items-center gap-1.5">
                <Droplets className="h-4 w-4" /> +{ml}ml
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" className="input flex-1" placeholder="Мөлшерді енгізіңіз (мл)" value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustom()} />
            <button className="btn-primary" onClick={addCustom}><Plus className="h-4 w-4" /> Қосу</button>
          </div>
          {records.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Бүгінгі жазбалар</p>
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm bg-cream/50 rounded-lg px-3 py-2">
                  <span className="text-ink font-medium">{r.amount_ml} мл</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(r); setEditAmount(String(r.amount_ml)); }} className="p-1.5 text-ink-muted hover:text-primary-dark"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDelId(r.id)} className="p-1.5 text-ink-muted hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Су ішу жазбасын өңдеу" size="sm" footer={<><button className="btn-ghost" onClick={() => setEditing(null)}>Болдырмау</button><button className="btn-primary" onClick={updateRecord}>Сақтау</button></>}>
        <label className="label">Мөлшері (мл)</label>
        <input type="number" className="input" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
      </Modal>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={del} title="Су ішу жазбасын өшіресіз бе?" message="Бұл жазба өшіріледі." />
    </Card>
  );
}

function ActivitySection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { records, total, reload } = useTodayActivity();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('Жаяу жүру');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState('moderate');
  const [editing, setEditing] = useState<ActivityRecord | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const types = ['Жаяу жүру', 'Жүгіру', 'Велосипед тебу', 'Жүзу', 'Йога', 'Жаттығу залы', 'Би', 'Футбол', 'Баскетбол', 'Басқа'];

  const save = async () => {
    if (!user) return;
    const dur = parseInt(duration);
    if (!dur || dur <= 0) { toast('Ұзақтықты дұрыс енгізіңіз.', 'error'); return; }
    const payload = { user_id: user.id, activity_date: todayISO(), activity_type: type, duration_minutes: dur, intensity, id: editing?.id };
    const { error } = editing
      ? await supabase.from('activity_records').update(payload).eq('id', editing.id)
      : await supabase.from('activity_records').insert(payload);
    if (error) { toast('Жазбаны сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast(editing ? 'Белсенділік жаңартылды.' : 'Белсенділік қосылды.', 'success');
    setOpen(false);
    setEditing(null);
    reload();
  };

  const del = async () => {
    if (!delId) return;
    await supabase.from('activity_records').delete().eq('id', delId);
    toast('Белсенділік жазбасы өшірілді.', 'info');
    setDelId(null);
    reload();
  };

  return (
    <Card className="p-5">
      <SectionHeader
        title="Дене белсенділігі"
        subtitle={records.length ? `${records.length} жазба · барлығы ${total} мин` : 'Әзірге жазба жоқ'}
        action={<button className="btn-secondary" onClick={() => { setEditing(null); setType('Жаяу жүру'); setDuration('30'); setIntensity('moderate'); setOpen(true); }}><Plus className="h-4 w-4" /> Қосу</button>}
      />
      {records.length ? (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-cream/50 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary-light text-primary-dark flex items-center justify-center"><Activity className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-semibold text-ink">{activityTypeLabel(r.activity_type)}</p>
                  <p className="text-xs text-ink-muted">{r.duration_minutes} мин · {intensityLabel(r.intensity)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(r); setType(r.activity_type); setDuration(String(r.duration_minutes)); setIntensity(r.intensity || 'moderate'); setOpen(true); }} className="p-1.5 text-ink-muted hover:text-primary-dark"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDelId(r.id)} className="p-1.5 text-ink-muted hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Activity className="h-6 w-6" />} title="Бүгінгі белсенділік белгіленбеген" description="Күндік белсенділікті бақылау үшін жаттығу, серуен немесе қозғалысты енгізіңіз." />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Белсенділікті өңдеу' : 'Белсенділік қосу'} footer={<><button className="btn-ghost" onClick={() => setOpen(false)}>Болдырмау</button><button className="btn-primary" onClick={save}>Сақтау</button></>}>
        <div className="space-y-4">
          <div>
            <label className="label">Белсенділік түрі</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Ұзақтығы (мин)</label><input type="number" className="input" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
            <div>
              <label className="label">Қарқындылығы</label>
              <select className="input" value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                <option value="light">Жеңіл</option>
                <option value="moderate">Орташа</option>
                <option value="high">Жоғары</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={del} title="Белсенділікті өшіресіз бе?" message="Бұл жазба өшіріледі." />
    </Card>
  );
}

function MoodSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { record, reload } = useTodayMood();
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [delOpen, setDelOpen] = useState(false);

  const save = async (level: MoodLevel) => {
    if (!user) return;
    const { error } = await supabase.from('mood_records').upsert({
      user_id: user.id,
      mood_date: todayISO(),
      mood_level: level,
      note: note || null,
      id: record?.id,
    });
    if (error) { toast('Жазбаны сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast('Көңіл күй белгіленді.', 'success');
    setSelected(null);
    setNote(record?.note || '');
    reload();
  };

  const del = async () => {
    if (!record) return;
    await supabase.from('mood_records').delete().eq('id', record.id);
    toast('Көңіл күй жазбасы өшірілді.', 'info');
    setDelOpen(false);
    setNote('');
    reload();
  };

  return (
    <Card className="p-5">
      <SectionHeader
        title="Көңіл күй"
        subtitle={record ? `Бүгін: ${MOOD_META[record.mood_level].label}` : 'Бүгін өзіңізді қалай сезініп тұрсыз?'}
        action={record ? <button className="btn-danger px-3 py-2" onClick={() => setDelOpen(true)}><Trash2 className="h-4 w-4" /></button> : undefined}
      />
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => {
          const m = MOOD_META[level];
          const Icon = m.icon;
          const isActive = record?.mood_level === level || selected === level;
          return (
            <button
              key={level}
              onClick={() => { setSelected(level); save(level); }}
              className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all ${isActive ? `${m.bg} ring-2 ring-primary scale-105` : 'bg-cream/40 hover:bg-cream'}`}
            >
              <Icon className={`h-6 w-6 ${m.color}`} />
              <span className="text-[10px] font-medium text-ink-muted">{m.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <label className="label">Жазба (міндетті емес)</label>
        <textarea
          className="input min-h-[80px] resize-none"
          placeholder="Ойыңызда не бар?"
          defaultValue={record?.note || ''}
          onBlur={(e) => setNote(e.target.value)}
        />
        {record && record.note && <p className="text-xs text-ink-muted mt-2">Қазіргі жазба: {record.note}</p>}
      </div>
      <ConfirmDialog open={delOpen} onClose={() => setDelOpen(false)} onConfirm={del} title="Бүгінгі көңіл күй жазбасын өшіресіз бе?" message="Бүгінгі жазбаңыз өшіріледі." />
    </Card>
  );
}
