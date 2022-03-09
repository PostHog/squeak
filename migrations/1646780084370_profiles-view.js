/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createView(
        { schema: 'public', name: 'squeak_profiles_view' },
        { replace: true },
        `
    SELECT 
        squeak_profiles.id as id,
        squeak_profiles.first_name AS first_name, 
        squeak_profiles.last_name AS last_name, 
        squeak_profiles.avatar AS avatar, 
        squeak_profiles_readonly.role AS role
    FROM squeak_profiles
    JOIN 
        squeak_profiles_readonly ON squeak_profiles.id = squeak_profiles_readonly.id
        `
    )
}
