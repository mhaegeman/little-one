-- Extend the neighbourhood enum with the values added in app code
-- (lib/types.ts / lib/data/taxonomy.ts) but missing from the database.
-- Postgres requires each `add value` to run outside a transaction block,
-- so each statement uses `if not exists` and runs independently.

alter type neighbourhood add value if not exists 'Sydhavn';
alter type neighbourhood add value if not exists 'Klampenborg';
alter type neighbourhood add value if not exists 'Lyngby';
alter type neighbourhood add value if not exists 'Humlebæk';
alter type neighbourhood add value if not exists 'Roskilde';
