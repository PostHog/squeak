/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_messages' },
        {
            resolved: {
                type: 'boolean',
                notNull: true,
                default: false,
            },
            resolved_reply_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_replies' },
                referencesConstraintName: 'messages_resolved_reply_replies_id_fkey',
            },
        }
    )
}
