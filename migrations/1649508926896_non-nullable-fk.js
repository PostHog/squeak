/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.dropView({ schema: 'public', name: 'squeak_replies_view' })
    pgm.dropView({ schema: 'public', name: 'squeak_profiles_view' })

    pgm.dropPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow select to organization admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow update to organization admins')

    pgm.dropPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow insert to organization users')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow update to organization admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow delete to organization admins')

    pgm.dropPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Allow update to organization admins')

    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow insert to organization users')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow update to organization admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow delete to organization admins')

    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow insert to organization users')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to organization admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to user of feedback')

    pgm.dropPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow insert to organization admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow update to organization admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow delete to organization admins')
    pgm.dropPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow select to organization admins')

    pgm.alterColumn({ schema: 'public', name: 'squeak_config' }, 'organization_id', {
        type: 'uuid',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'config_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_messages' }, 'organization_id', {
        type: 'uuid',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'messages_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_profiles_readonly' }, 'organization_id', {
        type: 'uuid',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'profiles_readonly_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_profiles_readonly' }, 'profile_id', {
        type: 'uuid',
        references: { schema: 'public', name: 'squeak_profiles' },
        referencesConstraintName: 'profiles_readonly_profile_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_replies' }, 'organization_id', {
        type: 'uuid',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'replies_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_replies_feedback' }, 'organization_id', {
        type: 'uuid',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'replies_feedback_organization_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_replies_feedback' }, 'profile_id', {
        type: 'uuid',
        references: { schema: 'public', name: 'squeak_profiles' },
        referencesConstraintName: 'replies_feedback_profile_id_fkey',
        notNull: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_webhook_config' }, 'organization_id', {
        type: 'uuid',
        references: { schema: 'public', name: 'squeak_organizations' },
        referencesConstraintName: 'webhook_config_organization_id_fkey',
        notNull: true,
    })

    pgm.createView(
        { schema: 'public', name: 'squeak_profiles_view' },
        { replace: true },
        `
          SELECT
              squeak_profiles.id as profile_id,
              squeak_profiles_readonly.user_id as user_id,
              squeak_profiles_readonly.organization_id as organization_id,
              squeak_profiles.first_name AS first_name,
              squeak_profiles.last_name AS last_name,
              squeak_profiles.avatar AS avatar,
              squeak_profiles_readonly.role AS role
          FROM squeak_profiles
                   JOIN
               squeak_profiles_readonly ON squeak_profiles_readonly.profile_id = squeak_profiles.id
      `
    )

    pgm.createView(
        { schema: 'public', name: 'squeak_replies_view' },
        { replace: true },
        `
            SELECT
                r.id as reply_id,
                r.message_id as message_id,
                r.organization_id as organization_id,
                r.body as body,
                r.created_at as created_at,
                coalesce(upvote.count, 0) as upvote_count,
                coalesce(downvote.count, 0) as downvote_count,
                coalesce(spam.count, 0) as spam_count
            FROM squeak_replies r
            LEFT JOIN (SELECT count(*) as count, reply_id FROM squeak_replies_feedback WHERE type = 'upvote' GROUP BY reply_id) upvote ON r.id = upvote.reply_id
            LEFT JOIN (SELECT count(*) as count, reply_id FROM squeak_replies_feedback WHERE type = 'downvote' GROUP BY reply_id) downvote ON r.id = downvote.reply_id
            LEFT JOIN (SELECT count(*) as count, reply_id FROM squeak_replies_feedback WHERE type = 'spam' GROUP BY reply_id) spam ON r.id = spam.reply_id
        `
    )

    pgm.createPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow select to organization admins', {
        command: 'SELECT',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_config' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow insert to organization users', {
        command: 'INSERT',
        check: '"public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles_readonly' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow insert to organization users', {
        command: 'INSERT',
        check: '"public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow insert to organization users', {
        command: 'INSERT',
        check: '"public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies_feedback' }, 'Allow delete to user of feedback', {
        command: 'DELETE',
        using: '"public"."check_profile_access"(profile_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow select to organization admins', {
        command: 'SELECT',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow insert to organization admins', {
        command: 'INSERT',
        check: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow update to organization admins', {
        command: 'UPDATE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_webhook_config' }, 'Allow delete to organization admins', {
        command: 'DELETE',
        using: '"public"."get_is_admin"() AND "public"."check_organization_access"(organization_id)',
    })
}
