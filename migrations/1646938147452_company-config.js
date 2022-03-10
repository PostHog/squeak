/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            company_name: {
                type: 'text',
            },
            company_domain: {
                type: 'text',
            },
        }
    )
}
