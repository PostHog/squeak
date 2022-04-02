/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.createIndex({ schema: 'public', name: 'squeak_replies_feedback' }, ['type'], {
        name: 'squeak_profiles_feedback_type_idx',
    })

    pgm.createIndex({ schema: 'public', name: 'squeak_replies_feedback' }, ['profile_id', 'reply_id', 'type'], {
        name: 'squeak_profiles_feedback_profile_reply_type_idx',
        unique: true,
    })

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
}
