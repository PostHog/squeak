/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.dropView({ schema: 'public', name: 'squeak_profiles_view' })

    pgm.dropColumns({ schema: 'public', name: 'squeak_profiles_readonly' }, ['profile_id'])

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
            profile_id: {
                type: 'bigint',
                notNull: true,
                references: { schema: 'public', name: 'squeak_profiles' },
                referencesConstraintName: 'profiles_readonly_profile_id_fkey',
            },
        }
    )

    pgm.createView(
        { schema: 'public', name: 'squeak_profiles_view' },
        { replace: true },
        `
    SELECT
        squeak_profiles.id as profile_id,
        squeak_profiles_readonly.user_id as user_id,
        squeak_profiles_readonly.organisation_id as organization_id,
        squeak_profiles.first_name AS first_name, 
        squeak_profiles.last_name AS last_name, 
        squeak_profiles.avatar AS avatar, 
        squeak_profiles_readonly.role AS role
    FROM squeak_profiles
    JOIN 
        squeak_profiles_readonly ON squeak_profiles_readonly.profile_id = squeak_profiles.id
        `
    )

    pgm.createIndex({ schema: 'public', name: 'squeak_config' }, 'organisation_id', {
        name: 'squeak_config_organization_id_idx',
        unique: true,
    })

    pgm.createIndex(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        ['profile_id', 'organisation_id', 'user_id'],
        {
            name: 'squeak_profiles_readonly_profiles_user_organization_idx',
            unique: true,
        }
    )
}
