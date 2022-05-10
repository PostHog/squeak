/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            mailgun_from_name: {
                type: 'text',
                default: null,
            },
        }
    )
    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            mailgun_from_email: {
                type: 'text',
                default: null,
            },
        }
    )
}
