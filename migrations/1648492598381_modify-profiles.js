/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    // Add the user_id columns to both profile tables
    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles' },
        {
            user_id: {
                type: 'uuid',
                notNull: true,
                references: { schema: 'auth', name: 'users' },
                referencesConstraintName: 'profiles_user_id_fkey',
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        {
            user_id: {
                type: 'uuid',
                notNull: true,
                references: { schema: 'auth', name: 'users' },
                referencesConstraintName: 'profiles_readonly_user_id_fkey',
            },
        }
    )

    // Update the get_is_admin to use the new user_id columns
    pgm.sql(`CREATE OR REPLACE FUNCTION "public"."get_is_admin"()
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER SET search_path = public
    as $$
        SELECT CASE WHEN role = 'admin' THEN true ELSE false END
        FROM squeak_profiles_readonly
        WHERE user_id = auth.uid()
    $$;`)

    // Update the view to use the new user_id columns
    pgm.createView(
        { schema: 'public', name: 'squeak_profiles_view' },
        { replace: true },
        `
    SELECT 
        squeak_profiles.user_id as id,
        squeak_profiles.first_name AS first_name, 
        squeak_profiles.last_name AS last_name, 
        squeak_profiles.avatar AS avatar, 
        squeak_profiles_readonly.role AS role
    FROM squeak_profiles
    JOIN 
        squeak_profiles_readonly ON squeak_profiles.user_id = squeak_profiles_readonly.user_id
        `
    )

    // Drop the dependent columns on squeak_profiles.id
    pgm.dropColumns({ schema: 'public', name: 'squeak_replies' }, ['profile_id'])
    pgm.dropColumns({ schema: 'public', name: 'squeak_messages' }, ['profile_id'])

    // Drop the dependent policies on squeak_profiles.id
    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow insert with matching ID', {
        ifExists: true,
    })

    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow update with matching ID', {
        ifExists: true,
    })

    // Drop the id column on squeak_profiles
    pgm.dropColumns({ schema: 'public', name: 'squeak_profiles' }, ['id'])

    // Re-create the ID column on squeak_profiles
    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_profiles_id_seq',
                    start: 1,
                    increment: 1,
                    minValue: false,
                    maxValue: false,
                    cache: 1,
                    precedence: 'BY DEFAULT',
                },
            },
        }
    )

    // Add the dependent columns on squeak_profiles.id
    pgm.addColumns(
        { schema: 'public', name: 'squeak_replies' },
        {
            profile_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_profiles' },
                referencesConstraintName: 'replies_profile_id_fkey',
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_messages' },
        {
            profile_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_profiles' },
                referencesConstraintName: 'replies_profile_id_fkey',
            },
        }
    )

    // Add the dependent policies on squeak_profiles.user_id
    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow update with matching ID', {
        command: 'UPDATE',
        using: 'auth.uid() = user_id',
    })

    // Drop the dependent policies on squeak_profiles_readonly.id
    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Allow update to admins', {
        ifExists: true,
    })

    // Drop the id column on squeak_profiles_readonly
    pgm.dropColumns({ schema: 'public', name: 'squeak_profiles_readonly' }, ['id'])

    // Re-create the ID column on squeak_profiles_readonly
    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_profiles_readonly_id_seq',
                    start: 1,
                    increment: 1,
                    minValue: false,
                    maxValue: false,
                    cache: 1,
                    precedence: 'BY DEFAULT',
                },
            },
        }
    )

    // Add the dependent policies on squeak_profiles_readonly.user_id
    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Allow update to admins', {
        command: 'UPDATE',
        using: 'auth.role() = \'authenticated\' and auth.uid() != user_id and "public"."get_is_admin"()',
    })
}
