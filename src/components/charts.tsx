import { ReactNode } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Card } from './ui';

const AXIS = { fontSize: 11, fill: '#859087' };
const GRID = '#E5EAE3';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E5EAE3',
  boxShadow: '0 4px 16px rgba(38,52,43,0.08)',
  fontSize: 12,
  padding: '8px 12px',
};

interface CommonProps {
  data: Array<Record<string, number | string | undefined>>;
  xKey: string;
  yKey: string;
  height?: number;
  color?: string;
  unit?: string;
  goal?: number;
  empty?: ReactNode;
}

export function SleepAreaChart({ data, xKey, yKey, height = 260, color = '#789B7D', goal = 480, empty }: CommonProps) {
  const hasData = data.some((d) => d[yKey] !== undefined && d[yKey] !== null);
  if (!hasData && empty) return <Card className="p-4">{empty}</Card>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 60)} сағ`} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`${(Number(v) / 60).toFixed(1)} сағ`, 'Ұйқы']}
        />
        {goal && <ReferenceLine y={goal} stroke="#355B45" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: '8 сағаттық мақсат', position: 'right', fill: '#859087', fontSize: 10 }} />}
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} fill="url(#sleepGrad)" connectNulls dot={{ r: 3, fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WaterBarChart({ data, xKey, yKey, height = 260, color = '#5b9aa5', goal = 2500, empty }: CommonProps) {
  const hasData = data.some((d) => d[yKey] !== undefined && d[yKey] !== null);
  if (!hasData && empty) return <Card className="p-4">{empty}</Card>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000) * 1000}`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} мл`, 'Су ішу']} />
        {goal && <ReferenceLine y={goal} stroke="#355B45" strokeDasharray="4 4" strokeOpacity={0.4} />}
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ActivityBarChart({ data, xKey, yKey, height = 260, color = '#789B7D', empty }: CommonProps) {
  const hasData = data.some((d) => d[yKey] !== undefined && d[yKey] !== null);
  if (!hasData && empty) return <Card className="p-4">{empty}</Card>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} мин`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} мин`, 'Белсенділік']} />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const MOOD_COLORS = ['#e11d48', '#f59e0b', '#64748b', '#789B7D', '#059669'];

export function MoodLineChart({ data, xKey, yKey, height = 260, empty }: CommonProps) {
  const hasData = data.some((d) => d[yKey] !== undefined && d[yKey] !== null);
  if (!hasData && empty) return <Card className="p-4">{empty}</Card>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => {
            const labels = ['', 'Өте төмен', 'Төмен', 'Қалыпты', 'Жақсы', 'Өте жақсы'];
            return [labels[Number(v)] || '—', 'Көңіл күй'];
          }}
        />
        <Line type="monotone" dataKey={yKey} stroke="#789B7D" strokeWidth={2.5} connectNulls dot={{ r: 4, fill: '#789B7D' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MoodBarChart({ data, xKey, yKey, height = 260, empty }: CommonProps) {
  const hasData = data.some((d) => d[yKey] !== undefined && d[yKey] !== null);
  if (!hasData && empty) return <Card className="p-4">{empty}</Card>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => {
            const labels = ['', 'Өте төмен', 'Төмен', 'Қалыпты', 'Жақсы', 'Өте жақсы'];
            return [labels[Number(v)] || '—', 'Көңіл күй'];
          }}
        />
        <Bar dataKey={yKey} radius={[6, 6, 0, 0]} maxBarSize={36}>
          {data.map((d, i) => (
            <Cell key={i} fill={MOOD_COLORS[(Number(d[yKey]) || 3) - 1]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ComparisonRowProps {
  label: string;
  current: number | null;
  previous: number | null;
  unit: string;
  invert?: boolean;
  formatter?: (v: number) => string;
}

export function ComparisonRow({ label, current, previous, unit, invert, formatter }: ComparisonRowProps) {
  const delta = current !== null && previous !== null && previous !== 0 ? ((current - previous) / previous) * 100 : null;
  const flat = delta === null || Math.abs(delta) < 1;
  const up = delta !== null && delta > 0;
  const good = flat ? null : invert ? !up : up;
  const color = good === null ? 'text-ink-muted' : good ? 'text-emerald-600' : 'text-rose-600';
  const arrow = flat ? '→' : up ? '↑' : '↓';

  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <span className="text-sm text-ink font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-ink">{current === null ? '—' : (formatter ? formatter(current) : `${current}${unit}`)}</p>
          <p className="text-[10px] text-ink-muted">prev: {previous === null ? '—' : (formatter ? formatter(previous) : `${previous}${unit}`)}</p>
        </div>
        <span className={`text-xs font-bold w-16 text-right ${color}`}>
          {delta === null ? 'n/a' : `${arrow} ${Math.abs(delta).toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
}
