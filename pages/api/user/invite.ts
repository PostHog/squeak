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

    const { organizationId, email, role = 'admin', firstName } = JSON.parse(req.body)

    const { origin } = absoluteUrl(req)

    const { data: invitedUser, error: invitedUserError } = await supabaseServiceRoleClient.auth.api.inviteUserByEmail(
        email,
        {
            redirectTo: `${origin}/login`,
        }
    )

    if (!invitedUser || invitedUserError) {
        console.error(`[🧵 Invite] Error creating user profile`)
        res.status(500)

        if (invitedUserError) {
            console.error(`[🧵 Invite] ${invitedUserError.message}`)

            res.status(500).json({ error: invitedUserError.message })
        }

        return
    }

    const { data: userProfile, error: userProfileError } = await supabaseServerClient({ res, req })
        .from<UserProfile>('squeak_profiles')
        .insert({ first_name: firstName })
        .limit(1)
        .single()

    if (userProfileError) {
        console.error(`[🧵 Invite] ${userProfileError.message}`)
        res.status(500).json({ error: userProfileError.message })
        return
    }

    const { error: userProfileReadonlyError } = await supabaseServerClient({ res, req })
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .insert({
            role,
            profile_id: userProfile.id,
            user_id: invitedUser.id,
            organisation_id: organizationId,
        })
        .limit(1)
        .single()

    if (userProfileReadonlyError) {
        console.error(`[🧵 Invite] ${userProfileReadonlyError.message}`)
        res.status(500).json({ error: userProfileReadonlyError.message })
        return
    }

    res.json(true)
})
