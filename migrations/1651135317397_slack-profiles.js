/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles_readonly' },
        {
            slack_user_id: {
                type: 'text',
            },
        }
    )

    pgm.alterColumn({ schema: 'public', name: 'squeak_profiles_readonly' }, 'user_id', { allowNull: true })

    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            show_slack_user_profiles: {
                type: 'boolean',
                notNull: true,
                default: false,
            },
        }
    )
}
