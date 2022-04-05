/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.alterColumn({ schema: 'public', name: 'squeak_messages' }, 'profile_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_profiles' },
        referencesConstraintName: 'messages_profile_id_fkey',
        allowNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_replies' }, 'profile_id', {
        type: 'bigint',
        references: { schema: 'public', name: 'squeak_profiles' },
        referencesConstraintName: 'replies_profile_id_fkey',
        allowNull: true,
    })
}
