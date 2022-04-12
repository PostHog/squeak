/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            allowed_origins: {
                type: 'text[]',
            },
        }
    )
}
