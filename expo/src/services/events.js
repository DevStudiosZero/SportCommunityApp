import { supabase } from '../supabaseClient';

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

async function getMyDisplayInfo() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { display_name: null, avatar_url: null };
  const { data } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  return {
    display_name: data?.full_name || user.email || 'Athlet',
    avatar_url: data?.avatar_url || null
  };
}

const DISTANCE_SPORTS = ['Laufen', 'Rad', 'Schwimmen'];

export async function listEvents(filters = {}) {
  const { city, sports, dateFrom, dateTo, minDistance, maxDistance, levels, pacerOffered, pacerWanted } = filters;

  let query = supabase.from('events').select('*').order('date', { ascending: true });
  if (city) query = query.eq('city', city);
  if (Array.isArray(sports) && sports.length > 0) query = query.in('sport', sports);
  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);
  
  const allowDistance = !sports || sports.length === 0 || sports.some((s) => DISTANCE_SPORTS.includes(s));
  if (allowDistance) {
    if (typeof minDistance === 'number') query = query.gte('distance_km', minDistance);
    if (typeof maxDistance === 'number') query = query.lte('distance_km', maxDistance);
  }

  if (Array.isArray(levels) && levels.length > 0) {
    query = query.in('level', levels);
  }

  if (pacerWanted) {
    query = query.eq('pacer_wanted', true);
  }

  const { data: events, error } = await query;
  if (error) throw error;

  const ids = (events || []).map(e => e.id);
  if (ids.length === 0) return [];
  const { data: parts, error: perr } = await supabase
    .from('participants')
    .select('event_id, user_id, pacer')
    .in('event_id', ids);
  if (perr) throw perr;
  const partCounts = (parts || []).reduce((acc, p) => {
    acc[p.event_id] = (acc[p.event_id] || 0) + 1;
    return acc;
  }, {});
  const pacerMap = (parts || []).reduce((acc, p) => {
    if (p.pacer) acc[p.event_id] = (acc[p.event_id] || 0) + 1;
    return acc;
  }, {});

  const { data: boosts, error: berr } = await supabase
    .from('boosts')
    .select('event_id, user_id')
    .in('event_id', ids);
  if (berr) throw berr;
  const boostCounts = (boosts || []).reduce((acc, b) => {
    acc[b.event_id] = (acc[b.event_id] || 0) + 1;
    return acc;
  }, {});

  let result = events.map(e => ({ 
    ...e, 
    participantsCount: partCounts[e.id] || 0, 
    boostsCount: boostCounts[e.id] || 0,
    pacerCount: pacerMap[e.id] || 0
  }));

  if (pacerOffered) {
    result = result.filter(e => (e.pacerCount || 0) > 0);
  }

  return result;
}

export async function getEventById(id) {
  const { data: event, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw error;
  const { data: parts, error: perr } = await supabase
    .from('participants')
    .select('event_id, user_id, pacer, display_name, avatar_url')
    .eq('event_id', id);
  if (perr) throw perr;

  const { data: boosts, error: berr } = await supabase
    .from('boosts')
    .select('event_id, user_id')
    .eq('event_id', id);
  if (berr) throw berr;

  const userId = await getCurrentUserId();
  const joined = !!parts?.find(p => p.user_id === userId);
  const boostedByMe = !!boosts?.find(b => b.user_id === userId);
  const boostsCount = (boosts || []).length;
  const myPacer = !!parts?.find(p => p.user_id === userId && p.pacer);

  return { event, participants: parts || [], joined, boostedByMe, boostsCount, myPacer };
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

export async function createEvent({ title, sport, dateStr, timeStr, location_text, distance_km, pace, description, visibility = 'public', city, level = null, pacer_wanted = false }) {
  const host_id = await getCurrentUserId();
  if (!host_id) throw new Error('Nicht eingeloggt');
  const isoDate = parseDateTime(dateStr, timeStr);
  const payload = { title, sport, date: isoDate, location_text, distance_km, pace, description, visibility, city, host_id, level, pacer_wanted };
  const { data, error } = await supabase.from('events').insert([payload]).select().single();
  if (error) throw error;
  const me = await getMyDisplayInfo();
  await supabase.from('participants').upsert({ event_id: data.id, user_id: host_id, display_name: me.display_name, avatar_url: me.avatar_url });
  return data;
}

export async function joinEvent(event_id, pacer = false) {
  const user_id = await getCurrentUserId();
  if (!user_id) throw new Error('Nicht eingeloggt');
  const me = await getMyDisplayInfo();
  const { error } = await supabase.from('participants').upsert({ event_id, user_id, pacer, display_name: me.display_name, avatar_url: me.avatar_url });
  if (error) throw error;
}

export async function setPacer(event_id, pacer) {
  const user_id = await getCurrentUserId();
  if (!user_id) throw new Error('Nicht eingeloggt');
  const me = await getMyDisplayInfo();
  const { error } = await supabase.from('participants').upsert({ event_id, user_id, pacer, display_name: me.display_name, avatar_url: me.avatar_url });
  if (error) throw error;
}

export async function leaveEvent(event_id) {
  const user_id = await getCurrentUserId();
  if (!user_id) throw new Error('Nicht eingeloggt');
  const { error } = await supabase.from('participants').delete().match({ event_id, user_id });
  if (error) throw error;
}

export async function boostEvent(event_id) {
  const user_id = await getCurrentUserId();
  if (!user_id) throw new Error('Nicht eingeloggt');
  const { error } = await supabase.from('boosts').insert({ event_id, user_id });
  if (error) throw error;
}

export async function unboostEvent(event_id) {
  const user_id = await getCurrentUserId();
  if (!user_id) throw new Error('Nicht eingeloggt');
  const { error } = await supabase.from('boosts').delete().match({ event_id, user_id });
  if (error) throw error;
}