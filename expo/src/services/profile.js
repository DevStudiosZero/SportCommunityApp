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

export async function getProfileById(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
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

export async function uploadAvatar(uri) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht eingeloggt');
  const fileName = `${user.id}_${Date.now()}.jpg`;
  const path = `avatars/${user.id}/${fileName}`;
  const res = await fetch(uri);
  const blob = await res.blob();
  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true
  });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function savePushToken(token) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !token) return;
  await supabase.from('profiles').upsert({ id: user.id, expo_push_token: token }, { onConflict: 'id' });
}

export async function getHostBoosts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, byEvent: [] };
  return getHostBoostsByUser(user.id);
}

export async function getHostBoostsByUser(userId) {
  const { data: events, error: eerr } = await supabase
    .from('events')
    .select('id, title')
    .eq('host_id', userId);
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