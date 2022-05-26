/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createTable(
        { schema: 'public', name: 'squeak_topics' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_topics_id_seq',
                    start: 1,
                    increment: 1,
                    minValue: false,
                    maxValue: false,
                    cache: 1,
                    precedence: 'BY DEFAULT',
                },
            },
            created_at: {
                type: 'timestamp with time zone',
                default: pgm.func('NOW()'),
                notNull: true,
            },
            organization_id: {
                type: 'uuid',
                references: { schema: 'public', name: 'squeak_organizations' },
                referencesConstraintName: 'topics_organization_id_fkey',
                notNull: true,
            },
            label: {
                type: 'text',
            },
        }
    )

    pgm.sql('ALTER TABLE public.squeak_topics ENABLE ROW LEVEL SECURITY')

    pgm.createPolicy({ schema: 'public', name: 'squeak_topics' }, 'Allow select to all', {
        command: 'SELECT',
        using: 'true',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_topics' }, 'Allow insert to organization admins', {
        command: 'INSERT',
        check: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_topics' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_topics' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.addColumns(
        { schema: 'public', name: 'squeak_messages' },
        {
            topics: {
                type: 'text[]',
            },
        }
    )
}
