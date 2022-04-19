import { getUser } from '@supabase/supabase-auth-helpers/nextjs'
import { createClient } from '@supabase/supabase-js'
import { definitions } from '../../@types/supabase'
import withMultiTenantCheck from '../../util/withMultiTenantCheck'
import createUserProfile from '../../util/createUserProfile'
import createUserProfileReadonly from '../../util/createUserProfileReadonly'
import trackUserSignup from '../../util/posthog/trackUserSignup'
import trackOrganizationSignup from '../../util/posthog/trackOrganizationSignup'

type Config = definitions['squeak_config']
type Organization = definitions['squeak_organizations']

// This API route is for user signup for a multi tenant application.
export default withMultiTenantCheck(async (req, res) => {
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { user } = await getUser({ req, res })

    if (!user) {
        res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
        return
    }

    const { firstName, lastName, organizationName, url, distinctId } = JSON.parse(req.body)

    if (!firstName || !lastName || !organizationName || !url) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const { data: organization, error: organisatizationError } = await supabaseServiceRoleClient
        .from<Organization>('squeak_organizations')
        .insert({
            name: organizationName,
        })
        .limit(1)
        .single()

    if (!organization || organisatizationError) {
        console.error(`[🧵 Signup] Error creating organization`)

        res.status(500)

        if (organisatizationError) {
            console.error(`[🧵 Signup] ${organisatizationError.message}`)

            res.json({ error: organisatizationError.message })
        }

        return
    }

    const { data: config, error: configError } = await supabaseServiceRoleClient
        .from<Config>('squeak_config')
        .insert({
            organization_id: organization.id,
            preflight_complete: true,
            company_domain: url,
            company_name: organizationName,
        })
        .limit(1)
        .single()

    if (!config || configError) {
        console.error(`[🧵 Signup] Error creating config`)

        res.status(500)

        if (configError) {
            console.error(`[🧵 Signup] ${configError.message}`)

            res.json({ error: configError.message })
        }

        return
    }

    const { data: userProfile, error: userProfileError } = await createUserProfile(firstName, lastName)

    if (!userProfile || userProfileError) {
        console.error(`[🧵 Signup] Error creating user profile`)

        res.status(500)

        if (userProfileError) {
            console.error(`[🧵 Signup] ${userProfileError.message}`)

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
        console.error(`[🧵 Signup] Error creating user readonly profile`)

        res.status(500)

        if (userProfileReadonlyError) {
            console.error(`[🧵 Signup] ${userProfileReadonlyError.message}`)

            res.json({ error: userProfileReadonlyError.message })
        }

        return
    }

    res.status(200).json({ userId: user.id, firstName, lastName, organizationId: organization.id, organizationName })

    trackUserSignup(user, distinctId, { firstName, lastName, role: 'admin' })
    trackOrganizationSignup(user, organization, {})
})
