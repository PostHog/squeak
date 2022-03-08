/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        {
            id: {
                type: 'uuid',
                notNull: true,
                primaryKey: true,
                references: { schema: 'auth', name: 'users' },
                referencesConstraintName: 'profiles_readonly_id_fkey',
            },
            role: { type: 'string', notNull: true, default: 'user' },
        }
    )

    pgm.sql('ALTER TABLE public.squeak_profiles_readonly ENABLE ROW LEVEL SECURITY')

    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Enable access to all users', {
        command: 'SELECT',
        using: 'true',
    })

    pgm.sql('GRANT ALL ON TABLE public.squeak_profiles_readonly TO postgres')
    pgm.sql('GRANT ALL ON TABLE public.squeak_profiles_readonly TO anon')
    pgm.sql('GRANT ALL ON TABLE public.squeak_profiles_readonly TO authenticated')
    pgm.sql('GRANT ALL ON TABLE public.squeak_profiles_readonly TO service_role')

    pgm.sql(`CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    as $$
    BEGIN
        INSERT INTO squeak_profiles (id)
        VALUES (new.id);
                
        INSERT INTO squeak_profiles_readonly (id, role)
        VALUES (new.id, (SELECT CASE WHEN preflight_complete THEN 'user' ELSE 'admin' END from squeak_config));
        
        RETURN new;
    END;
    $$;`)

    pgm.createTrigger({ schema: 'auth', name: 'users' }, 'on_auth_user_created', {
        when: 'AFTER',
        operation: 'INSERT',
        function: { schema: 'public', name: 'handle_new_user' },
        level: 'ROW',
    })

    pgm.sql(`CREATE OR REPLACE FUNCTION "public"."get_is_admin"()
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER SET search_path = public
    as $$
        SELECT CASE WHEN role = 'admin' THEN true ELSE false END
        FROM squeak_profiles_readonly
        WHERE id = auth.uid()
    $$;`)

    pgm.sql('ALTER TABLE public.squeak_config ENABLE ROW LEVEL SECURITY')

    pgm.createPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow access to admins', {
        command: 'SELECT',
        using: 'auth.role() = \'authenticated\' and "public"."get_is_admin"()',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow update to admins', {
        command: 'UPDATE',
        using: 'auth.role() = \'authenticated\' and "public"."get_is_admin"()',
    })
}
