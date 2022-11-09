import { NextApiRequest, NextApiResponse } from 'next'
import absoluteUrl from 'next-absolute-url'

import prisma from '../../lib/db'
// import withMultiTenantCheck from '../../util/withMultiTenantCheck'
import trackUserSignup from '../../util/posthog/trackUserSignup'
import trackOrganizationSignup from '../../util/posthog/trackOrganizationSignup'

import { getSessionUser } from '../../lib/auth'
import { sendUserConfirmation } from '../../lib/email'
import { getConfirmationToken } from '../../db'

export interface SetupUserRequestPayload {
    firstName: string
    lastName: string
    organizationName: string
    url: string
}

export interface SetupUserResponse {
    userId: string
    firstName: string
    lastName: string
    organizationId: string
    organizationName: string
}

// POST /api/user-setup
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await getSessionUser(req)

    if (!user) {
        res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
        return
    }

    const { firstName, lastName, organizationName, url }: SetupUserRequestPayload = req.body

    if (!firstName || !lastName || !organizationName || !url) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }
    // Create the squeak_config entry for the organization
    const organization = await prisma.organization.update({
        where: {
            id: user.organizationId,
        },
        data: {
            name: organizationName,
        },
    })

    // Create the squeak_config entry for the organization
    const config = await prisma.squeakConfig.create({
        data: {
            organization_id: user.organizationId,
            company_domain: url,
            company_name: organizationName,
            preflight_complete: true,
        },
    })

    if (!config) {
        console.error(`[🧵 Signup] Error creating config`)
        res.status(500)
        return
    }

    const userProfile = await prisma.profile.update({
        where: {
            id: user.profileId,
        },
        data: {
            first_name: firstName,
            last_name: lastName,
        },
    })

    if (!userProfile) {
        console.error(`[🧵 Signup] Error creating user profile`)

        res.status(500)

        return
    }

    const response: SetupUserResponse = {
        userId: user.id,
        firstName,
        lastName,
        organizationId: user.organizationId,
        organizationName,
    }

    // Set the org cookie in the session
    res.status(200).json(response)

    const confirmationToken = await getConfirmationToken(user)

    const { origin } = absoluteUrl(req)
    const redirectUrl = `${origin}/profile`
    const confirmationUrl = `${origin}/api/user/confirm?token=${confirmationToken}&redirect=${redirectUrl}`

    await trackUserSignup(user, { firstName, lastName, role: 'admin' })
    await trackOrganizationSignup(user, organization, {})
    await sendUserConfirmation(organization.id, user, confirmationUrl)
}

export default handler
