import withAdminAccess from '../../../util/withAdminAccess'
import { createClient } from '@supabase/supabase-js'
import absoluteUrl from 'next-absolute-url'
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../../../@types/supabase'

type UserProfile = definitions['squeak_profiles']
type UserProfileReadonly = definitions['squeak_profiles_readonly']

export default withAdminAccess(async (req, res) => {
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { email, role = 'admin', firstName } = JSON.parse(req.body)

    const { origin } = absoluteUrl(req)

    const { data: invitedUser, error: invitedUserError } = await supabaseServiceRoleClient.auth.api.inviteUserByEmail(
        email,
        {
            redirectTo: `${origin}/login`,
        }
    )

    if (invitedUserError) {
        res.status(500).json({ error: invitedUserError.message })
        return
    }

    const { data: updatedUserReadonly, error: updatedUserReadonlyError } = await supabaseServerClient({ res, req })
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .update({ role })
        .match({ id: invitedUser?.id })
        .limit(1)
        .single()

    if (updatedUserReadonlyError) {
        res.status(500).json({ error: updatedUserReadonlyError.message })
        return
    }

    if (firstName) {
        const { error: updatedUserError } = await supabaseServerClient({ res, req })
            .from<UserProfile>('squeak_profiles')
            .update({ first_name: firstName })
            .match({ id: invitedUser?.id })
            .limit(1)
            .single()

        if (updatedUserError) {
            res.status(500).json({ error: updatedUserError.message })
            return
        }
    }

    res.json(updatedUserReadonly)
})
