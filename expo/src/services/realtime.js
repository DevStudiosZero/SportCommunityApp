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