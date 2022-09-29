import withAdminAccess from '../../../util/withAdminAccess'
import absoluteUrl from 'next-absolute-url'
import createUserProfileReadonly from '../../../util/createUserProfileReadonly'
import createUserProfile from '../../../util/createUserProfile'
import trackUserSignup from '../../../util/posthog/trackUserSignup'
import { sendUserInvite } from '../../../lib/email'
import { findUserByEmail, inviteUser } from '../../../db'

export default withAdminAccess(async (req, res) => {
    const { organizationId, email, role = 'admin', firstName } = req.body

    const { origin } = absoluteUrl(req)

    const user = await findUserByEmail(email)
    if (user) {
        return res.status(400).json({ error: 'User with this email already exists' })
    }

    const invitedUser = await inviteUser(email)

    if (!invitedUser) {
        console.error(`[🧵 Invite] Error inviting user`)
        res.status(500).json({ error: 'Error inviting user' })

        return
    }

    const { data: userProfile, error: userProfileError } = await createUserProfile({
        first_name: firstName,
    })

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

    const redirectUrl = `${origin}/profile`

    const confirmationUrl = `${origin}/api/user/confirm?token=${invitedUser.confirmation_token}&redirect=${redirectUrl}`
    await sendUserInvite(organizationId, invitedUser, confirmationUrl)

    res.status(201).json({ success: true })
    trackUserSignup(invitedUser, { firstName, role })
})
