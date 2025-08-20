# message-push (Supabase Edge Function)

Sendet Expo Push-Benachrichtigungen bei neuen Nachrichten.

## Voraussetzungen
- Supabase CLI installiert (oder Deployment im Web-Dashboard)
- In Supabase > Authentication > Users existieren Nutzer, profiles Tabelle hat Spalte `expo_push_token`
- Client speichert Expo Push Token via `savePushToken(token)` (bereits im Code umgesetzt)

## Env Variablen (Function)
- SUPABASE_URL = https://<PROJECT>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY = (Service Role Key aus Settings > API)
- EXPO_PUSH_TITLE_PREFIX = "Neue Nachricht" (optional)

Setze diese im Dashboard: Project Settings > Functions > Environment Variables

## Deploy

```bash
cd supabase/functions/message-push
supabase functions deploy message-push --project-ref <PROJECT-REF>
```

Lokaler Test:
```bash
supabase functions serve message-push
# dann via curl ein INSERT-ähnliches Payload posten
curl -X POST http://localhost:54321/functions/v1/message-push \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "INSERT",
    "record": {
      "event_id": "00000000-0000-0000-0000-000000000000",
      "from_user_id": "11111111-1111-1111-1111-111111111111",
      "to_user_id": "22222222-2222-2222-2222-222222222222",
      "content": "Test Nachricht",
      "from_display_name": "Max"
    }
  }'
```

## Datenbank-Trigger/Hook
Empfohlen: Database Webhook im Supabase Dashboard anlegen:
- Database > Webhooks (oder Functions Hooks) > Add Hook
- Table: public.messages, Event: INSERT
- Target: Edge Function `message-push`

Falls nicht verfügbar, Alternative via Trigger und `http`/`pg_net` Extension:

```sql
-- Sicherstellen, dass http oder pg_net verfügbar ist
create extension if not exists http;

create or replace function public.notify_message_insert() returns trigger as $$
declare
  payload jsonb;
  resp jsonb;
begin
  payload := jsonb_build_object(
    'type','INSERT',
    'record', to_jsonb(NEW)
  );

  perform http_post(
    'https://<PROJECT>.supabase.co/functions/v1/message-push',
    payload,
    'application/json'
  );

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_messages_insert
after insert on public.messages
for each row execute function public.notify_message_insert();
```

Hinweis: Für die abgesicherte Variante werden signierte Hooks empfohlen (Functions Hooks) statt direkter http_post aus Postgres.