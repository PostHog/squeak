import withPreflightCheck from '../../util/withPreflightCheck'
import createUserProfile from '../../util/createUserProfile'
import createUserProfileReadonly from '../../util/createUserProfileReadonly'
import trackUserSignup from '../../util/posthog/trackUserSignup'
import trackOrganizationSignup from '../../util/posthog/trackOrganizationSignup'
import { getSessionUser } from '../../lib/auth'
import prisma from '../../lib/db'

// This API route is for user setup in the self-hosted preflight.
export default withPreflightCheck(async (req, res) => {
    const user = await getSessionUser(req)

    if (!user) {
        res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
        return
    }

    const organizations = await prisma.organization.findMany()

    if (organizations?.length) {
        console.error(`[🧵 Setup] Organization already exists, limited to one`)

        res.status(500)
        res.json({ error: 'An organization already exists, maximum of one allowed' })
        return
    }

    const { firstName, lastName, organizationName, url, distinctId } = req.body

    if (!firstName || !lastName || !organizationName) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const organization = await prisma.organization.create({
        data: { name: organizationName },
    })

    if (!organization) {
        console.error(`[🧵 Setup] Error creating organization`)
        res.status(500).json({ error: 'An unexpected error occurred creating the organization' })

        return
    }

    const config = await prisma.squeakConfig.create({
        data: {
            organization_id: organization.id,
            preflight_complete: false,
            company_domain: url,
            company_name: organizationName,
        },
    })

    if (!config) {
        console.error(`[🧵 Setup] Error creating config`)
        res.status(500).json({ error: 'An unexpected error occurred creating config' })
        return
    }

    const { data: userProfile, error: userProfileError } = await createUserProfile({
        first_name: firstName,
        last_name: lastName,
    })

    if (!userProfile || userProfileError) {
        console.error(`[🧵 Setup] Error creating user profile`)

        res.status(500)

        if (userProfileError) {
            console.error(`[🧵 Setup] ${userProfileError.message}`)

            res.json({ error: userProfileError.message })
        }

        return
    }

    const { data: userProfileReadonly, error: userProfileReadonlyError } = await createUserProfileReadonly(
        user.id,
        organization.id,
        userProfile.id,
        'admin'
    )

    if (!userProfileReadonly || userProfileReadonlyError) {
        console.error(`[🧵 Setup] Error creating user readonly profile`)

        res.status(500)

        if (userProfileReadonlyError) {
            console.error(`[🧵 Setup] ${userProfileReadonlyError.message}`)

            res.json({ error: userProfileReadonlyError.message })
        }

        return
    }

    res.status(200).json({ userId: user.id, firstName, lastName, organizationId: organization.id, organizationName })

    trackUserSignup(user, distinctId, { firstName, lastName, role: 'admin' })
    trackOrganizationSignup(user, organization, {})
})
