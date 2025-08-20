import { supabase } from '../supabaseClient';

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function listEvents(filters = {}) {
  const { city, sports, dateFrom, dateTo, minDistance, maxDistance } = filters;

  let query = supabase.from('events').select('*').order('date', { ascending: true });
  if (city) query = query.eq('city', city);
  if (Array.isArray(sports) && sports.length > 0) query = query.in('sport', sports);
  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);
  if (typeof minDistance === 'number') query = query.gte('distance_km', minDistance);
  if (typeof maxDistance === 'number') query = query.lte('distance_km', maxDistance);

  const { data: events, error } = await query;
  if (error) throw error;

  // Fetch participants for listed events to compute counts
  const ids = (events || []).map(e => e.id);
  if (ids.length === 0) return [];
  const { data: parts, error: perr } = await supabase
    .from('participants')
    .select('event_id, user_id')
    .in('event_id', ids);
  if (perr) throw perr;
  const counts = (parts || []).reduce((acc, p) => {
    acc[p.event_id] = (acc[p.event_id] || 0) + 1;
    return acc;
  }, {});
  return events.map(e => ({ ...e, participantsCount: counts[e.id] || 0 }));
}

export async function getEventById(id) {
  const { data: event, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw error;
  const { data: parts, error: perr } = await supabase
    .from('participants')
    .select('event_id, user_id, pacer')
    .eq('event_id', id);
  if (perr) throw perr;
  const userId = await getCurrentUserId();
  const joined = !!parts?.find(p => p.user_id === userId);
  return { event, participants: parts || [], joined };
}

function parseDateTime(dateStr, timeStr) {
  try {
    const cleaned = dateStr.replace(/\.$/, '');
    const [d, m] = cleaned.split('.');
    const [hh, mm] = timeStr.split(':');
    const year = new Date().getFullYear();
    const dt = new Date(Date.UTC(Number(year), Number(m) - 1, Number(d), Number(hh), Number(mm)));
    return dt.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function createEvent({ title, sport, dateStr, timeStr, location_text, distance_km, pace, description, visibility = 'public', city }) {
  const host_id = await getCurrentUserId();
  if (!host_id) throw new Error('Nicht eingeloggt');
  const isoDate = parseDateTime(dateStr, timeStr);
  const payload = { title, sport, date: isoDate, location_text, distance_km, pace, description, visibility, city, host_id };
  const { data, error } = await supabase.from('events').insert([payload]).select().single();
  if (error) throw error;
  await supabase.from('participants').upsert({ event_id: data.id, user_id: host_id });
  return data;
}

export async function joinEvent(event_id, pacer = false) {
  const user_id = await getCurrentUserId();
  if (!user_id) throw new Error('Nicht eingeloggt');
  const { error } = await supabase.from('participants').upsert({ event_id, user_id, pacer });
  if (error) throw error;
}

export async function leaveEvent(event_id) {
  const user_id = await getCurrentUserId();
  if (!user_id) throw new Error('Nicht eingeloggt');
  const { error } = await supabase.from('participants').delete().match({ event_id, user_id });
  if (error) throw error;
}