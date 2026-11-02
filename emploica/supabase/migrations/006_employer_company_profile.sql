alter table employer_profiles
  add column if not exists sector text,
  add column if not exists city text,
  add column if not exists logo_url text;
