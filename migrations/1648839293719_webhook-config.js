/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createTable(
        { schema: 'public', name: 'squeak_webhook_config' },
        {
            id: {
                type: 'bigint',
                primaryKey: true,
                sequenceGenerated: {
                    name: 'squeak_webhook_config_id_seq',
                    start: 1,
                    increment: 1,
                    minValue: false,
                    maxValue: false,
                    cache: 1,
                    precedence: 'BY DEFAULT',
                },
            },
            type: {
                type: 'text',
                notNull: true,
            },
            url: {
                type: 'text',
                notNull: true,
            },
        }
    )
}
