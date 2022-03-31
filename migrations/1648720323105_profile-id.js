/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.dropColumns({ schema: 'public', name: 'squeak_profiles_readonly' }, ['id'])

    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        {
            profile_id: {
                type: 'bigint',
                notNull: true,
                primaryKey: true,
                references: { schema: 'public', name: 'squeak_profiles' },
                referencesConstraintName: 'profiles_readonly_profile_id_fkey',
            },
        }
    )

    // Update the view to use the new columns
    pgm.createView(
        { schema: 'public', name: 'squeak_profiles_view' },
        { replace: true },
        `
    SELECT 
        squeak_profiles_readonly.user_id as id,
        squeak_profiles.first_name AS first_name, 
        squeak_profiles.last_name AS last_name, 
        squeak_profiles.avatar AS avatar, 
        squeak_profiles_readonly.role AS role
    FROM squeak_profiles
    JOIN 
        squeak_profiles_readonly ON squeak_profiles_readonly.profile_id = squeak_profiles.id
        `
    )

    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow update with matching ID', {
        ifExists: true,
    })

    pgm.dropColumns({ schema: 'public', name: 'squeak_profiles' }, ['user_id'])
}
