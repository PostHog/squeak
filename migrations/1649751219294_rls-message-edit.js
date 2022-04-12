/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to user of feedback')

    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow update to user of message', {
        command: 'UPDATE',
        using: '"public"."check_organization_access"(organization_id) AND "public"."check_profile_access"(profile_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to user of feedback', {
        command: 'DELETE',
        using: '"public"."check_organization_access"(organization_id) AND "public"."check_profile_access"(profile_id)',
    })
}
