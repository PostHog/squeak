exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_organizations' },
        { uuid: { type: 'uuid', notNull: true, default: pgm.func('gen_random_uuid()') } }
    )

    pgm.addColumns({ schema: 'public', name: 'squeak_config' }, { organization_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_config
        SET organization_uuid = (
            SELECT uuid
            FROM squeak_organizations
            WHERE id = squeak_config.organization_id
        )
    `)

    pgm.addColumns({ schema: 'public', name: 'squeak_messages' }, { organization_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_messages
        SET organization_uuid = (
            SELECT uuid
            FROM squeak_organizations
            WHERE id = squeak_messages.organization_id
        )
    `)

    pgm.addColumns({ schema: 'public', name: 'squeak_profiles_readonly' }, { organization_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_profiles_readonly
        SET organization_uuid = (
            SELECT uuid
            FROM squeak_organizations
            WHERE id = squeak_profiles_readonly.organization_id
        )
    `)

    pgm.addColumns({ schema: 'public', name: 'squeak_replies' }, { organization_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_replies
        SET organization_uuid = (
            SELECT uuid
            FROM squeak_organizations
            WHERE id = squeak_replies.organization_id
        )
    `)

    pgm.addColumns({ schema: 'public', name: 'squeak_replies_feedback' }, { organization_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_replies_feedback
        SET organization_uuid = (
            SELECT uuid
            FROM squeak_organizations
            WHERE id = squeak_replies_feedback.organization_id
        )
    `)

    pgm.addColumns({ schema: 'public', name: 'squeak_webhook_config' }, { organization_uuid: { type: 'uuid' } })

    pgm.sql(`
        UPDATE squeak_webhook_config
        SET organization_uuid = (
            SELECT uuid
            FROM squeak_organizations
            WHERE id = squeak_webhook_config.organization_id
        )
    `)
}
