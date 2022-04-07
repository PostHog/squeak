/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.dropView({ schema: 'public', name: 'squeak_profiles_view' })

    pgm.alterColumn({ schema: 'public', name: 'squeak_config' }, 'organization_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'config_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_messages' }, 'organization_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'messages_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_messages' }, 'profile_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_profiles' },
        referencesConstraintName: 'messages_profile_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_profiles_readonly' }, 'organization_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'profiles_readonly_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_replies' }, 'message_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_messages' },
        referencesConstraintName: 'replies_message_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_replies' }, 'organization_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'replies_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_replies' }, 'profile_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_profiles' },
        referencesConstraintName: 'replies_profile_id_fkey',
        notNull: true,
    })

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
}
