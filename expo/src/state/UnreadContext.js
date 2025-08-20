import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const UnreadContext = createContext();

export function UnreadProvider({ children }) {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCount(0);
      setReady(true);
      return;
    }
    const { count: c } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('to_user_id', user.id)
      .is('read_at', null);
    setCount(c || 0);
    setReady(true);
  }, []);

  useEffect(() => {
    let channel;
    (async () => {
      await refresh();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase.channel(`unread-${user.id}`);
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `to_user_id=eq.${user.id}` }, () => refresh());
      channel.subscribe();
    })();
    return () => channel && supabase.removeChannel(channel);
  }, [refresh]);

  const value = useMemo(() => ({ count, ready, refresh }), [count, ready, refresh]);
  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export function useUnread() {
  const ctx = useContext(UnreadContext);
  if (!ctx) throw new Error('useUnread must be used within UnreadProvider');
  return ctx;
}