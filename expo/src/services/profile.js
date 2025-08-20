import { supabase } from '../supabaseClient';

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) return null;
  return data;
}

export async function upsertProfile({ city, sports, full_name, avatar_url }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht eingeloggt');
  const payload = { id: user.id, city, sports, full_name, avatar_url };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHostBoosts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, byEvent: [] };

  const { data: events, error: eerr } = await supabase
    .from('events')
    .select('id, title')
    .eq('host_id', user.id);
  if (eerr) throw eerr;
  if (!events || events.length === 0) return { total: 0, byEvent: [] };

  const ids = events.map(e => e.id);
  const { data: boosts, error: berr } = await supabase
    .from('boosts')
    .select('event_id')
    .in('event_id', ids);
  if (berr) throw berr;

  const counts = (boosts || []).reduce((acc, b) => {
    acc[b.event_id] = (acc[b.event_id] || 0) + 1;
    return acc;
  }, {});

  const byEvent = events.map(e => ({
    event_id: e.id,
    title: e.title,
    count: counts[e.id] || 0
  })).filter(x => x.count > 0);

  const total = byEvent.reduce((s, x) => s + x.count, 0);
  return { total, byEvent };
}