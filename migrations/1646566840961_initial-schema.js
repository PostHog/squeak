exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createTable(
        { schema: 'public', name: 'squeak_config' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_config_id_seq',
                    start: 1,
                    increment: 1,
                    minValue: false,
                    maxValue: false,
                    cache: 1,
                    precedence: 'BY DEFAULT',
                },
            },
            preflight_complete: {
                type: 'boolean',
                notNull: true,
                default: false,
            },
            slack_api_key: {
                type: 'text',
            },
            slack_question_channel: {
                type: 'text',
            },
            slack_signing_secret: {
                type: 'text',
            },
            mailgun_api_key: {
                type: 'text',
            },
            mailgun_domain: {
                type: 'text',
            },
        }
    )

    pgm.sql('GRANT ALL ON TABLE public.squeak_config TO postgres')
    pgm.sql('GRANT ALL ON TABLE public.squeak_config TO anon')
    pgm.sql('GRANT ALL ON TABLE public.squeak_config TO authenticated')
    pgm.sql('GRANT ALL ON TABLE public.squeak_config TO service_role')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_config_id_seq TO postgres')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_config_id_seq TO anon')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_config_id_seq TO authenticated')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_config_id_seq TO service_role')

    pgm.createTable(
        { schema: 'public', name: 'squeak_messages' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_messages_id_seq',
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
            },
            subject: {
                type: 'text',
            },
            slug: {
                type: 'text[]',
            },
            published: {
                type: 'boolean',
                notNull: true,
                default: false,
            },
            slack_timestamp: {
                type: 'text',
            },
        }
    )

    pgm.sql('GRANT ALL ON TABLE public.squeak_messages TO postgres')
    pgm.sql('GRANT ALL ON TABLE public.squeak_messages TO anon')
    pgm.sql('GRANT ALL ON TABLE public.squeak_messages TO authenticated')
    pgm.sql('GRANT ALL ON TABLE public.squeak_messages TO service_role')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_messages_id_seq TO postgres')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_messages_id_seq TO anon')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_messages_id_seq TO authenticated')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_messages_id_seq TO service_role')

    pgm.createTable(
        { schema: 'public', name: 'squeak_profiles' },
        {
            id: {
                type: 'uuid',
                notNull: true,
                primaryKey: true,
                references: { schema: 'auth', name: 'users' },
                referencesConstraintName: 'profiles_id_fkey',
            },
            first_name: {
                type: 'text',
            },
            last_name: {
                type: 'text',
            },
            avatar: {
                type: 'text',
            },
        }
    )

    pgm.sql('GRANT ALL ON TABLE public.squeak_profiles TO postgres')
    pgm.sql('GRANT ALL ON TABLE public.squeak_profiles TO anon')
    pgm.sql('GRANT ALL ON TABLE public.squeak_profiles TO authenticated')
    pgm.sql('GRANT ALL ON TABLE public.squeak_profiles TO service_role')

    pgm.createTable(
        { schema: 'public', name: 'squeak_replies' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_replies_id_seq',
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
            },
            body: {
                type: 'text',
            },
            message_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_messages' },
                referencesConstraintName: 'replies_message_id_fkey',
            },
            profile_id: {
                type: 'uuid',
                references: { schema: 'public', name: 'squeak_profiles' },
                referencesConstraintName: 'replies_profile_id_fkey',
            },
        }
    )

    pgm.sql('GRANT ALL ON TABLE public.squeak_replies TO postgres')
    pgm.sql('GRANT ALL ON TABLE public.squeak_replies TO anon')
    pgm.sql('GRANT ALL ON TABLE public.squeak_replies TO authenticated')
    pgm.sql('GRANT ALL ON TABLE public.squeak_replies TO service_role')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_replies_id_seq TO postgres')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_replies_id_seq TO anon')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_replies_id_seq TO authenticated')
    pgm.sql('GRANT ALL ON SEQUENCE public.squeak_replies_id_seq TO service_role')
}
