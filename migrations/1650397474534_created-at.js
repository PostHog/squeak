/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_organizations' },
        {
            created_at: {
                type: 'timestamp with time zone',
                default: pgm.func('NOW()'),
                notNull: true,
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles' },
        {
            created_at: {
                type: 'timestamp with time zone',
                default: pgm.func('NOW()'),
                notNull: true,
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        {
            created_at: {
                type: 'timestamp with time zone',
                default: pgm.func('NOW()'),
                notNull: true,
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_replies_feedback' },
        {
            created_at: {
                type: 'timestamp with time zone',
                default: pgm.func('NOW()'),
                notNull: true,
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_webhook_config' },
        {
            created_at: {
                type: 'timestamp with time zone',
                default: pgm.func('NOW()'),
                notNull: true,
            },
        }
    )
}
