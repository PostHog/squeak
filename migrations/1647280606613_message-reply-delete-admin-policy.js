/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow delete to admins', {
        command: 'DELETE',
        using: 'auth.role() = \'authenticated\' and "public"."get_is_admin"()',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow delete to admins', {
        command: 'DELETE',
        using: 'auth.role() = \'authenticated\' and "public"."get_is_admin"()',
    })
}
