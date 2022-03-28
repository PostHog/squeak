/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createTable(
        { schema: 'public', name: 'squeak_organization' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_organization_id_seq',
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

    pgm.sql('GRANT ALL ON TABLE public.squeak_organization TO postgres')
    pgm.sql('GRANT ALL ON TABLE public.squeak_organization TO anon')
    pgm.sql('GRANT ALL ON TABLE public.squeak_organization TO authenticated')
    pgm.sql('GRANT ALL ON TABLE public.squeak_organization TO service_role')

    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            organisation_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organization' },
                referencesConstraintName: 'config_organization_id_fkey',
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_messages' },
        {
            organisation_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organization' },
                referencesConstraintName: 'messages_organization_id_fkey',
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        {
            organisation_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organization' },
                referencesConstraintName: 'profiles_readonly_organization_id_fkey',
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_replies' },
        {
            organisation_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organization' },
                referencesConstraintName: 'replies_organization_id_fkey',
            },
        }
    )

    pgm.dropTrigger({ schema: 'auth', name: 'users' }, 'on_auth_user_created')
    pgm.sql(`DROP FUNCTION "public"."handle_new_user"()`)
}
