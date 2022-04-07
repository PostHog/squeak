/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    // Organizations (squeak_organizations)

    // Enable row level security
    pgm.sql('ALTER TABLE public.squeak_webhook_config ENABLE ROW LEVEL SECURITY')

    // Allow select to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow select to organization admins', {
        command: 'SELECT',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Allow insert to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow insert to organization admins', {
        command: 'INSERT',
        check: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Allow update to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Allow deletion to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })
}
