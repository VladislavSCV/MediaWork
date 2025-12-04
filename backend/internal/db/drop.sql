DO $$
DECLARE
    r RECORD;
BEGIN
    -- Удаляем все таблицы
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;

    -- Удаляем все последовательности
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequencename) || ' CASCADE;';
    END LOOP;

    -- Удаляем все представления
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE;';
    END LOOP;

    -- Удаляем все функции
    FOR r IN (SELECT routine_name, specific_name FROM information_schema.routines WHERE routine_schema = 'public')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE;';
    END LOOP;
END $$;
