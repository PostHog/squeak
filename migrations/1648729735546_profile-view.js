/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    // Update the view to use the new columns
    pgm.dropView({ schema: 'public', name: 'squeak_profiles_view' })
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
}
