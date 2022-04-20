/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
    pgm.alterColumn({ schema: 'public', name: 'squeak_config' }, 'question_auto_publish', {
        default: true,
    })

    pgm.alterColumn({ schema: 'public', name: 'squeak_config' }, 'reply_auto_publish', {
        default: true,
    })
}
