create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

grant update on public.notifications to authenticated;
