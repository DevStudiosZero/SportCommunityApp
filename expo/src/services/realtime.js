import { supabase } from '../supabaseClient';

export function subscribeEvents({ onChange }) {
  const channel = supabase.channel('events-changes');
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
    onChange?.('events', payload);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeParticipants({ onChange, eventId }) {
  const channel = supabase.channel(`participants-${eventId}`);
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `event_id=eq.${eventId}` }, (payload) => {
    onChange?.('participants', payload);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeBoosts({ onChange, eventId }) {
  const channel = supabase.channel(`boosts-${eventId}`);
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'boosts', filter: `event_id=eq.${eventId}` }, (payload) => {
    onChange?.('boosts', payload);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeAllParticipants({ onChange }) {
  const channel = supabase.channel('participants-all');
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, (payload) => {
    onChange?.('participants', payload);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeAllBoosts({ onChange }) {
  const channel = supabase.channel('boosts-all');
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'boosts' }, (payload) => {
    onChange?.('boosts', payload);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeMessages({ onChange, eventId }) {
  const channel = supabase.channel(`messages-${eventId}`);
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `event_id=eq.${eventId}` }, (payload) => {
    onChange?.('messages', payload);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeMyIncomingMessages({ userId, onInsert }) {
  const channel = supabase.channel(`messages-inbox-${userId}`);
  channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user_id=eq.${userId}` }, (payload) => {
    onInsert?.(payload);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}