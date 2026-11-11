import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { SleepRecord, WaterRecord, ActivityRecord, MoodRecord } from '@/types';

interface DateRange {
  from: string;
  to: string;
}

export function useSleepRecords(range: DateRange) {
  const { user } = useAuth();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('sleep_date', range.from)
      .lte('sleep_date', range.to)
      .order('sleep_date', { ascending: true });
    setRecords((data as SleepRecord[]) || []);
    setLoading(false);
  }, [user, range.from, range.to]);

  useEffect(() => { load(); }, [load]);
  return { records, loading, reload: load };
}

export function useWaterRecords(range: DateRange) {
  const { user } = useAuth();
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('water_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', range.from)
      .lte('log_date', range.to)
      .order('log_date', { ascending: true });
    setRecords((data as WaterRecord[]) || []);
    setLoading(false);
  }, [user, range.from, range.to]);

  useEffect(() => { load(); }, [load]);
  return { records, loading, reload: load };
}

export function useActivityRecords(range: DateRange) {
  const { user } = useAuth();
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('activity_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('activity_date', range.from)
      .lte('activity_date', range.to)
      .order('activity_date', { ascending: true });
    setRecords((data as ActivityRecord[]) || []);
    setLoading(false);
  }, [user, range.from, range.to]);

  useEffect(() => { load(); }, [load]);
  return { records, loading, reload: load };
}

export function useMoodRecords(range: DateRange) {
  const { user } = useAuth();
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('mood_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('mood_date', range.from)
      .lte('mood_date', range.to)
      .order('mood_date', { ascending: true });
    setRecords((data as MoodRecord[]) || []);
    setLoading(false);
  }, [user, range.from, range.to]);

  useEffect(() => { load(); }, [load]);
  return { records, loading, reload: load };
}
