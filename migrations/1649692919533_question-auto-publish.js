/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_config' },
        {
            question_auto_publish: {
                type: 'boolean',
                notNull: true,
                default: false,
            },
        }
    )
}
