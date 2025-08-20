// Supabase Edge Function: message-push
// Sends Expo push notification to message recipient when a new message is inserted
// Env vars required in Supabase dashboard for this function:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// Optional:
//   EXPO_PUSH_TITLE_PREFIX (e.g., "Neue Nachricht")

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TITLE_PREFIX = Deno.env.get("EXPO_PUSH_TITLE_PREFIX") ?? "Neue Nachricht";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface DbEventPayload {
  type: string; // "INSERT" | "UPDATE" | ...
  table?: string;
  schema?: string;
  record?: any;
  new?: any; // sometimes payload uses new
}

async function sendExpoPush(to: string, title: string, body: string) {
  const resp = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, title, body })
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Expo push failed: ${resp.status} ${txt}`);
  }
}

serve(async (req) => {
  try {
    const event = (await req.json()) as DbEventPayload;
    const row = event.record ?? (event as any).new;

    if (!row || event.type !== "INSERT") {
      return new Response(JSON.stringify({ ok: true, msg: "ignored" }), { status: 200 });
    }

    // Ignore self-notify
    if (row.from_user_id && row.to_user_id && row.from_user_id === row.to_user_id) {
      return new Response(JSON.stringify({ ok: true, msg: "self message ignored" }), { status: 200 });
    }

    // Fetch recipient push token
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", row.to_user_id)
      .maybeSingle();
    if (error) throw error;

    const token = profile?.expo_push_token as string | undefined;
    if (!token) {
      return new Response(JSON.stringify({ ok: true, msg: "no token" }), { status: 200 });
    }

    const senderName: string = row.from_display_name ?? "Athlet";
    const content: string = String(row.content ?? "");
    const body = content.length > 140 ? content.slice(0, 137) + "…" : content;

    await sendExpoPush(token, `${TITLE_PREFIX} • ${senderName}`, body);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});