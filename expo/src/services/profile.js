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

export async function upsertProfile({ city, sports }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht eingeloggt');
  const payload = { id: user.id, city, sports };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}