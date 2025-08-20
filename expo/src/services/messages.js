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

export async function listMessagesForConversation(event_id, other_user_id) {
  const me = await getCurrentUser();
  if (!me) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('id, event_id, from_user_id, to_user_id, content, created_at, from_display_name, from_avatar_url')
    .eq('event_id', event_id)
    .or(`and(from_user_id.eq.${me.id},to_user_id.eq.${other_user_id}),and(from_user_id.eq.${other_user_id},to_user_id.eq.${me.id})`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listConversations() {
  const me = await getCurrentUser();
  if (!me) return [];
  const { data: msgs, error } = await supabase
    .from('messages')
    .select('id, event_id, from_user_id, to_user_id, content, created_at, from_display_name, from_avatar_url')
    .or(`from_user_id.eq.${me.id},to_user_id.eq.${me.id})`)
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  const conversationsMap = new Map();
  const partnerIds = new Set();
  const eventIds = new Set();
  for (const m of msgs || []) {
    const other = m.from_user_id === me.id ? m.to_user_id : m.from_user_id;
    const key = `${m.event_id}:${other}`;
    if (!conversationsMap.has(key)) {
      conversationsMap.set(key, { key, event_id: m.event_id, with_user_id: other, last: m });
      partnerIds.add(other);
      eventIds.add(m.event_id);
    }
  }
  const partners = partnerIds.size > 0
    ? (await supabase.from('profiles').select('id, full_name, avatar_url').in('id', Array.from(partnerIds))).data || []
    : [];
  const events = eventIds.size > 0
    ? (await supabase.from('events').select('id, title').in('id', Array.from(eventIds))).data || []
    : [];
  const partnersMap = new Map(partners.map(p => [p.id, p]));
  const eventsMap = new Map(events.map(e => [e.id, e]));
  return Array.from(conversationsMap.values()).map(c => ({
    ...c,
    with_profile: partnersMap.get(c.with_user_id) || null,
    event: eventsMap.get(c.event_id) || null
  }));
}

export async function sendMessage(event_id, content, to_user_idOverride = null) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Nicht eingeloggt');
  if (!content || !content.trim()) throw new Error('Nachricht ist leer');

  let to_user_id = to_user_idOverride;
  if (!to_user_id) {
    const { data: event, error: eerr } = await supabase
      .from('events')
      .select('host_id')
      .eq('id', event_id)
      .single();
    if (eerr) throw eerr;
    to_user_id = event?.host_id;
  }
  if (!to_user_id) throw new Error('Empfänger unbekannt');

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