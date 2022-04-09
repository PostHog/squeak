/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_profiles' },
        { uuid: { type: 'uuid', notNull: true, default: pgm.func('gen_random_uuid()') } }
    )

    pgm.addColumns({ schema: 'public', name: 'squeak_profiles_readonly' }, { profile_uuid: { type: 'uuid' } })

    pgm.sql(`
      UPDATE squeak_profiles_readonly
      SET profile_uuid = (
          SELECT uuid
          FROM squeak_profiles
          WHERE id = squeak_profiles_readonly.profile_id
      )
  `)

    pgm.addColumns({ schema: 'public', name: 'squeak_messages' }, { profile_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_messages
        SET profile_uuid = (
            SELECT uuid
            FROM squeak_profiles
            WHERE id = squeak_messages.profile_id
        )
    `)

    pgm.addColumns({ schema: 'public', name: 'squeak_replies' }, { profile_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_replies
        SET profile_uuid = (
            SELECT uuid
            FROM squeak_profiles
            WHERE id = squeak_replies.profile_id
        )
    `)

    pgm.addColumns({ schema: 'public', name: 'squeak_replies_feedback' }, { profile_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_replies_feedback
        SET profile_uuid = (
            SELECT uuid
            FROM squeak_profiles
            WHERE id = squeak_replies_feedback.profile_id
        )
    `)
}
