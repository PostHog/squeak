/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_messages' },
        {
            faq: {
                type: 'boolean',
                default: false,
                notNull: true,
            },
        }
    )
}
