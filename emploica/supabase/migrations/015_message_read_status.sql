drop policy if exists "messages_insert_sender" on public.messages;

create policy "messages_insert_conversation_sender"
  on public.messages for insert
  with check (
    auth.uid()::text = sender_id
    and sender_id <> receiver_id
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and auth.uid()::text = any (conversations.participants)
        and receiver_id = any (conversations.participants)
    )
  );

create policy "messages_update_receiver_read"
  on public.messages for update
  using (
    auth.uid()::text = receiver_id
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and auth.uid()::text = any (conversations.participants)
    )
  )
  with check (
    auth.uid()::text = receiver_id
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and auth.uid()::text = any (conversations.participants)
    )
  );

revoke update on public.messages from authenticated;
grant update (status) on public.messages to authenticated;
