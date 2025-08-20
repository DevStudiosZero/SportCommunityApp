import { supabase } from '../supabaseClient';

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getMyDisplayInfo() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { full_name: null, avatar_url: null };
  const { data } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  return { full_name: data?.full_name || user.email || 'Athlet', avatar_url: data?.avatar_url || null };
}

export async function listMessages(event_id) {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('id, event_id, from_user_id, to_user_id, content, created_at, from_display_name, from_avatar_url')
    .eq('event_id', event_id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendMessage(event_id, content) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Nicht eingeloggt');
  if (!content || !content.trim()) throw new Error('Nachricht ist leer');

  // find host for event
  const { data: event, error: eerr } = await supabase
    .from('events')
    .select('host_id')
    .eq('id', event_id)
    .single();
  if (eerr) throw eerr;
  const to_user_id = event?.host_id;
  const { full_name, avatar_url } = await getMyDisplayInfo();

  const payload = {
    event_id,
    from_user_id: user.id,
    to_user_id,
    content: content.trim(),
    from_display_name: full_name,
    from_avatar_url: avatar_url
  };

  const { error } = await supabase.from('messages').insert(payload);
  if (error) throw error;
}