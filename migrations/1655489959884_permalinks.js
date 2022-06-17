/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_messages' },
        {
            permalink: {
                type: 'text',
            },
        }
    )
    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            permalink_base: {
                type: 'text',
            },
        }
    )
}
