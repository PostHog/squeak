/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_messages' },
        {
            profile_id: {
                type: 'uuid',
                references: { schema: 'public', name: 'squeak_profiles' },
                referencesConstraintName: 'messages_profile_id_fkey',
            },
        }
    )
}
