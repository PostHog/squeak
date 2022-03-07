/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.sql('ALTER TABLE public.squeak_profiles ENABLE ROW LEVEL SECURITY')

    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Enable access to all users', {
        command: 'SELECT',
        using: 'true',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow insert with matching ID', {
        command: 'INSERT',
        check: 'auth.uid() = id',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_profiles' }, 'Allow update with matching ID', {
        command: 'UPDATE',
        check: 'auth.uid() = id',
    })

    pgm.sql('ALTER TABLE public.squeak_messages ENABLE ROW LEVEL SECURITY')

    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Enable access to all users', {
        command: 'SELECT',
        using: 'true',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_messages' }, 'Enable insert access to all users', {
        command: 'INSERT',
        check: 'true',
    })

    pgm.sql('ALTER TABLE public.squeak_replies ENABLE ROW LEVEL SECURITY')

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Enable access to all users', {
        command: 'SELECT',
        using: 'true',
    })

    pgm.createPolicy({ schema: 'public', name: 'squeak_replies' }, 'Enable insert access to all users', {
        command: 'INSERT',
        check: 'true',
    })
}
