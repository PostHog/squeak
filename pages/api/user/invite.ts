import withAdminAccess from '../../../util/withAdminAccess'
import { createClient } from '@supabase/supabase-js'
import absoluteUrl from 'next-absolute-url'
import createUserProfileReadonly from '../../../util/createUserProfileReadonly'
import createUserProfile from '../../../util/createUserProfile'

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
        console.error(`[🧵 Invite] Error inviting user`)
        res.status(500)

        if (invitedUserError) {
            console.error(`[🧵 Invite] ${invitedUserError.message}`)

            res.status(500).json({ error: invitedUserError.message })
        }

        return
    }

    const { data: userProfile, error: userProfileError } = await createUserProfile(firstName)

    if (!userProfile || userProfileError) {
        console.error(`[🧵 Invite] Error inviting user`)

        res.status(500)

        if (userProfileError) {
            console.error(`[🧵 Invite] ${userProfileError.message}`)
            res.json({ error: userProfileError.message })
        }

        return
    }

    const { error: userProfileReadonlyError } = await createUserProfileReadonly(
        invitedUser.id,
        organizationId,
        userProfile.id,
        role
    )

    if (userProfileReadonlyError) {
        console.error(`[🧵 Invite] ${userProfileReadonlyError.message}`)
        res.status(500).json({ error: userProfileReadonlyError.message })
        return
    }

    res.json(true)
})
