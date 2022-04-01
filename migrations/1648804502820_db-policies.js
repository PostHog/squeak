/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    // Create a function to check organization access for a user
    pgm.sql(`CREATE OR REPLACE FUNCTION "public"."check_organization_access"(row_organization_id bigint)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER SET search_path = public
    as $$
        SELECT EXISTS (SELECT true FROM squeak_profiles_view WHERE organization_id = row_organization_id AND user_id = auth.uid());
    $$;`)

    // Create a function to check profile access for a user
    pgm.sql(`CREATE OR REPLACE FUNCTION "public"."check_profile_access"(row_profile_id bigint)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER SET search_path = public
    as $$
        SELECT EXISTS (SELECT true FROM squeak_profiles_view WHERE profile_id = row_profile_id AND user_id = auth.uid());
    $$;`)

    // Remove all the policies (to start from a clean slate)

    // Config (squeak_config)
    pgm.dropPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow access to admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow update to admins')

    // Messages (squeak_messages)
    pgm.dropPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow delete to admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_messages' }, 'Enable access to all users')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_messages' }, 'Enable insert access to all users')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow update to admins')

    // Profiles (squeak_profiles)
    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Enable access to all users')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow update to admins')

    // Profiles Readonly (squeak_profiles_readonly)
    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Allow update to admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Enable access to all users')

    // Replies (squeak_replies)
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow delete to admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies' }, 'Enable insert access to all users')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies' }, 'Enable access to all users')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow update to admins')

    // Add policies

    // pgmigrations - migrations library auto-generated table, no users should be able to do anything here, so just
    // enable row level security
    pgm.sql('ALTER TABLE public.pgmigrations ENABLE ROW LEVEL SECURITY')

    // Config (squeak_config)

    // Allow select to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow select to organization admins', {
        command: 'SELECT',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Do not allow insert for any users (this is handled by service user via the API)

    // Allow update to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Do not allow deletion for any users (this is handled by service user via the API)

    // Messages (squeak_messages)

    // All select to all users (so the questions can show via the snippet without a user needing to log in)
    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow select to all', {
        command: 'SELECT',
        using: 'true',
    })

    // All insert to all users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow insert to organization users', {
        command: 'INSERT',
        check: '"public"."check_organization_access"(organization_id)',
    })

    // Allow update to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Allow deletion to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Organizations (squeak_organizations)

    // Enable row level security
    pgm.sql('ALTER TABLE public.squeak_organizations ENABLE ROW LEVEL SECURITY')

    // Allow select to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_organizations' }, 'Allow select to organization admins', {
        command: 'SELECT',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(id)',
    })

    // Do not allow insert for any users (this is handled by service user via the API)

    // Allow update to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_organizations' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(id)',
    })

    // Do not allow deletion for any users (this is handled by service user via the API)

    // Profiles (squeak_profiles)

    // Allow select to all users (so the profiles can show via the snippet without a user needing to log in)
    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow select to all', {
        command: 'SELECT',
        using: 'true',
    })

    // Do not allow insert for any users (this is handled by service user via the API)

    // Allow update to user of profile
    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow update to user of profile', {
        command: 'UPDATE',
        using: '"public"."check_profile_access"(id)',
    })

    // Do not allow deletion for any users (this is handled by service user via the API)

    // Profiles Readonly (squeak_profiles_readonly)

    // Allow select to all users (so the profiles can show via the snippet without a user needing to log in)
    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Allow select to all', {
        command: 'SELECT',
        using: 'true',
    })

    // Do not allow insert for any users (this is handled by service user via the API)

    // Allow update to admins users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Do not allow deletion for any users (this is handled by service user via the API)

    // Replies (squeak_replies)

    // All select to all users (so the replies can show via the snippet without a user needing to log in)
    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow select to all', {
        command: 'SELECT',
        using: 'true',
    })

    // All insert to all users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow insert to organization users', {
        command: 'INSERT',
        check: '"public"."check_organization_access"(organization_id)',
    })

    // Allow update to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    // Allow deletion to admin users of the organization
    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })
}
