/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createTable(
        { schema: 'public', name: 'squeak_organizations' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_organizations_id_seq',
                    start: 1,
                    increment: 1,
                    minValue: false,
                    maxValue: false,
                    cache: 1,
                    precedence: 'BY DEFAULT',
                },
            },
            name: {
                type: 'text',
            },
        }
    )

    pgm.sql('GRANT ALL ON TABLE public.squeak_organizations TO postgres')
    pgm.sql('GRANT ALL ON TABLE public.squeak_organizations TO anon')
    pgm.sql('GRANT ALL ON TABLE public.squeak_organizations TO authenticated')
    pgm.sql('GRANT ALL ON TABLE public.squeak_organizations TO service_role')

    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            organisation_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organizations' },
                referencesConstraintName: 'config_organizations_id_fkey',
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_messages' },
        {
            organisation_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organizations' },
                referencesConstraintName: 'messages_organizations_id_fkey',
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        {
            organisation_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organizations' },
                referencesConstraintName: 'profiles_readonly_organizations_id_fkey',
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_replies' },
        {
            organisation_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organizations' },
                referencesConstraintName: 'replies_organizations_id_fkey',
            },
        }
    )
}
