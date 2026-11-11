import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { SleepRecord, WaterRecord, ActivityRecord, MoodRecord } from '@/types';
import { todayISO } from '@/lib/utils';

export function useTodaySleep() {
  const { user } = useAuth();
  const [record, setRecord] = useState<SleepRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('sleep_date', todayISO())
      .maybeSingle();
    setRecord(data as SleepRecord | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  return { record, loading, reload: load };
}

export function useTodayWater() {
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
      .eq('log_date', todayISO())
      .order('created_at', { ascending: false });
    setRecords((data as WaterRecord[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const total = records.reduce((s, r) => s + r.amount_ml, 0);
  return { records, total, loading, reload: load };
}

export function useTodayActivity() {
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
      .eq('activity_date', todayISO())
      .order('created_at', { ascending: false });
    setRecords((data as ActivityRecord[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const total = records.reduce((s, r) => s + r.duration_minutes, 0);
  return { records, total, loading, reload: load };
}

export function useTodayMood() {
  const { user } = useAuth();
  const [record, setRecord] = useState<MoodRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('mood_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('mood_date', todayISO())
      .maybeSingle();
    setRecord(data as MoodRecord | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  return { record, loading, reload: load };
}
