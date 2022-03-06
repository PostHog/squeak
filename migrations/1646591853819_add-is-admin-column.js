/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles' },
        {
            isAdmin: {
                type: 'boolean',
                notNull: true,
                default: false,
            },
        }
    )
}
