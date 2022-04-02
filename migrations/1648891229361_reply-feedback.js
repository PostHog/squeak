/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createTable(
        { schema: 'public', name: 'squeak_replies_feedback' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_replies_feedback_id_seq',
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
                references: { schema: 'public', name: 'squeak_profiles' },
                referencesConstraintName: 'replies_feedback_profile_id_fkey',
                notNull: true,
            },
            reply_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_replies' },
                referencesConstraintName: 'replies_feedback_reply_id_fkey',
                notNull: true,
            },
            organization_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organizations' },
                referencesConstraintName: 'replies_feedback_organization_id_fkey',
                notNull: true,
            },
            type: {
                type: 'text',
                notNull: true,
            },
        }
    )

    pgm.sql('ALTER TABLE public.squeak_replies_feedback ENABLE ROW LEVEL SECURITY')

    // All select to all users (so the reply feedback can show via the snippet without a user needing to log in)
    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow select to all', {
        command: 'SELECT',
        using: 'true',
    })

    // All insert to all users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow insert to organization users', {
        command: 'INSERT',
        check: '"public"."check_organization_access"(organization_id)',
    })

    // Do not allow update to any users

    // Allow deletion to user who created feedback
    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to user of feedback', {
        command: 'DELETE',
        using: '"public"."check_profile_access"(profile_id)',
    })

    // Allow deletion to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })
}
