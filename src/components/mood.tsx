import { MoodLevel } from '@/types';
import { Frown, Meh, Smile, Laugh, Angry } from 'lucide-react';

export const MOOD_META: Record<MoodLevel, { label: string; icon: typeof Smile; color: string; bg: string }> = {
  1: { label: 'Өте төмен', icon: Angry, color: 'text-rose-600', bg: 'bg-rose-100' },
  2: { label: 'Төмен', icon: Frown, color: 'text-amber-600', bg: 'bg-amber-100' },
  3: { label: 'Қалыпты', icon: Meh, color: 'text-slate-500', bg: 'bg-slate-100' },
  4: { label: 'Жақсы', icon: Smile, color: 'text-primary', bg: 'bg-primary-light' },
  5: { label: 'Өте жақсы', icon: Laugh, color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

export function MoodIcon({ level, size = 20 }: { level: MoodLevel; size?: number }) {
  const m = MOOD_META[level];
  const Icon = m.icon;
  return <Icon style={{ width: size, height: size }} className={m.color} />;
}
