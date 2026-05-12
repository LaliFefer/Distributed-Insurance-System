-- Run manually against policy_db if legacy rows have NULL event_id (JPA ddl-auto does not backfill).
UPDATE policies SET event_id = gen_random_uuid() WHERE event_id IS NULL;
