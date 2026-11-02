-- Structured offer attributes required by the complete offer filters.
alter table offers
  add column if not exists education_level text,
  add column if not exists experience_level text,
  add column if not exists salary_min integer,
  add column if not exists salary_max integer,
  add column if not exists is_filled boolean not null default false;

alter table offers
  drop constraint if exists offers_salary_range_check,
  add constraint offers_salary_range_check
    check (salary_min is null or salary_max is null or salary_min <= salary_max);

create index if not exists idx_offers_filled on offers(is_filled);
create index if not exists idx_offers_location_contract on offers(location_city, contract);
