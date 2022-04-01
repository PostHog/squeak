/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.addColumns(
        { schema: 'public', name: 'squeak_webhook_config' },
        {
            organization_id: {
                type: 'bigint',
                references: { schema: 'public', name: 'squeak_organizations' },
                referencesConstraintName: 'webhook_config_organization_id_fkey',
                notNull: true,
            },
        }
    )
}
