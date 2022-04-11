/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.alterColumn({ schema: 'public', name: 'squeak_messages' }, 'created_at', {
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_replies' }, 'created_at', {
        notNull: true,
    })
}
