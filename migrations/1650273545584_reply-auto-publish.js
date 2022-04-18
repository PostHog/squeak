/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            reply_auto_publish: {
                type: 'boolean',
                notNull: true,
                default: false,
            },
        }
    )

    pgm.addColumns(
        { schema: 'public', name: 'squeak_replies' },
        {
            published: {
                type: 'boolean',
                notNull: true,
                default: false,
            },
        }
    )
}
