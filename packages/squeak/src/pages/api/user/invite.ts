import { withAdminApiHandler } from '../../../util/withAdminAccess'
import absoluteUrl from 'next-absolute-url'
import trackUserSignup from '../../../util/posthog/trackUserSignup'
import { sendUserInvite } from '../../../lib/email'
import { findUserByEmail, inviteUser } from '../../../db'
import prisma from 'src/lib/db'

export default withAdminApiHandler(async (req, res, user) => {
    const { email, role = 'user', firstName } = req.body

    const { origin } = absoluteUrl(req)

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' })
    }

    const invitedUser = await inviteUser(email)

    if (!invitedUser) {
        console.error(`[🧵 Invite] Error inviting user`)
        res.status(500).json({ error: 'Error inviting user' })

        return
    }

    const userProfile = await prisma.profile.create({
        data: {
            first_name: firstName,
            user_id: invitedUser.id,
            organization_id: user.organizationId,
            role,
        },
    })

    if (!userProfile) {
        console.error(`[🧵 Invite] Error inviting user`)

        res.status(500)

        return
    }

    const redirectUrl = `${origin}/profile`

    const confirmationUrl = `${origin}/api/user/confirm?token=${invitedUser.confirmation_token}&redirect=${redirectUrl}`
    await sendUserInvite(user.organizationId, invitedUser, confirmationUrl)

    res.status(201).json({ success: true })
    trackUserSignup(invitedUser, { firstName, role })
})
