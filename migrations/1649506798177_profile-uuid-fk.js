/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    // Drop views
    pgm.dropView({ schema: 'public', name: 'squeak_profiles_view' })

    // Drop constraints
    pgm.dropConstraint({ schema: 'public', name: 'squeak_profiles_readonly' }, 'profiles_readonly_profile_id_fkey')
    pgm.dropConstraint({ schema: 'public', name: 'squeak_messages' }, 'replies_profile_id_fkey')
    pgm.dropConstraint({ schema: 'public', name: 'squeak_replies' }, 'replies_profile_id_fkey')
    pgm.dropConstraint({ schema: 'public', name: 'squeak_replies_feedback' }, 'replies_feedback_profile_id_fkey')

    // Drop policies that reference the old profile_id column
    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow update to user of profile')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to user of feedback')

    // Drop the old id column on profile, and rename the uuid to id and make it primary key
    pgm.dropColumns({ schema: 'public', name: 'squeak_profiles' }, ['id'])
    pgm.renameColumn({ schema: 'public', name: 'squeak_profiles' }, 'uuid', 'id')
    pgm.addConstraint({ schema: 'public', name: 'squeak_profiles' }, 'profiles_pkey', {
        primaryKey: 'id',
    })

    // Rename the foreign key column on all the dependent tables, and re-enable the foreign key constraint
    pgm.dropColumns({ schema: 'public', name: 'squeak_profiles_readonly' }, ['profile_id'])
    pgm.renameColumn({ schema: 'public', name: 'squeak_profiles_readonly' }, 'profile_uuid', 'profile_id')
    pgm.addConstraint({ schema: 'public', name: 'squeak_profiles_readonly' }, 'profiles_readonly_profile_id_fkey', {
        foreignKeys: {
            columns: 'profile_id',
            references: { schema: 'public', name: 'squeak_profiles' },
        },
    })

    pgm.dropColumns({ schema: 'public', name: 'squeak_messages' }, ['profile_id'])
    pgm.renameColumn({ schema: 'public', name: 'squeak_messages' }, 'profile_uuid', 'profile_id')
    pgm.addConstraint({ schema: 'public', name: 'squeak_messages' }, 'messages_profile_id_fkey', {
        foreignKeys: {
            columns: 'profile_id',
            references: { schema: 'public', name: 'squeak_profiles' },
        },
    })

    pgm.dropColumns({ schema: 'public', name: 'squeak_replies' }, ['profile_id'])
    pgm.renameColumn({ schema: 'public', name: 'squeak_replies' }, 'profile_uuid', 'profile_id')
    pgm.addConstraint({ schema: 'public', name: 'squeak_replies' }, 'replies_profile_id_fkey', {
        foreignKeys: {
            columns: 'profile_id',
            references: { schema: 'public', name: 'squeak_profiles' },
        },
    })

    pgm.dropColumns({ schema: 'public', name: 'squeak_replies_feedback' }, ['profile_id'])
    pgm.renameColumn({ schema: 'public', name: 'squeak_replies_feedback' }, 'profile_uuid', 'profile_id')
    pgm.addConstraint({ schema: 'public', name: 'squeak_replies_feedback' }, 'replies_feedback_profile_id_fkey', {
        foreignKeys: {
            columns: 'profile_id',
            references: { schema: 'public', name: 'squeak_profiles' },
        },
    })

    // Create views
    pgm.createView(
        { schema: 'public', name: 'squeak_profiles_view' },
        { replace: true },
        `
          SELECT
              squeak_profiles.id as profile_id,
              squeak_profiles_readonly.user_id as user_id,
              squeak_profiles_readonly.organization_id as organization_id,
              squeak_profiles.first_name AS first_name,
              squeak_profiles.last_name AS last_name,
              squeak_profiles.avatar AS avatar,
              squeak_profiles_readonly.role AS role
          FROM squeak_profiles
                   JOIN
               squeak_profiles_readonly ON squeak_profiles_readonly.profile_id = squeak_profiles.id
      `
    )

    // Create a function to check profile access for a user
    pgm.sql(`CREATE OR REPLACE FUNCTION "public"."check_profile_access"(row_profile_id uuid)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER SET search_path = public
    as $$
        SELECT EXISTS (SELECT true FROM squeak_profiles_view WHERE profile_id = row_profile_id AND user_id = auth.uid());
    $$;`)

    // Re-create DB policies
    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow update to user of profile', {
        command: 'UPDATE',
        using: '"public"."check_profile_access"(id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to user of feedback', {
        command: 'DELETE',
        using: '"public"."check_profile_access"(profile_id)',
    })
}
