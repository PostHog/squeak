/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Allow update to admins', {
        command: 'UPDATE',
        using: 'auth.role() = \'authenticated\' and auth.uid() != id and "public"."get_is_admin"()',
    })
}
