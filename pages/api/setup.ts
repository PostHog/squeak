import { createClient } from '@supabase/supabase-js'
import { getUser } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../../@types/supabase'
import withPreflightCheck from '../../util/withPreflightCheck'

type Config = definitions['squeak_config']
type Organization = definitions['squeak_organizations']
type UserProfile = definitions['squeak_profiles']
type UserProfileReadonly = definitions['squeak_profiles_readonly']

// This API route is for user setup in the self-hosted preflight.
export default withPreflightCheck(async (req, res) => {
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { user } = await getUser({ req, res })

    if (!user) {
        res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
        return
    }

    const { data: organizations } = await supabaseServiceRoleClient.from<Organization>('squeak_organizations')

    if (organizations?.length) {
        console.error(`[🧵 Setup] Organization already exists, limited to one`)

        res.status(500)
        res.json({ error: 'An organization already exists, maximum of one allowed' })
        return
    }

    const { firstName, lastName, organizationName, url } = JSON.parse(req.body)

    if (!firstName || !lastName || !organizationName) {
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
        console.error(`[🧵 Setup] Error creating organization`)

        res.status(500)

        if (organisatizationError) {
            console.error(`[🧵 Setup] ${organisatizationError.message}`)

            res.json({ error: organisatizationError.message })
        }

        return
    }

    const { data: config, error: configError } = await supabaseServiceRoleClient
        .from<Config>('squeak_config')
        .insert({
            organization_id: organization.id,
            preflight_complete: false,
            company_domain: url,
            company_name: organizationName,
        })
        .limit(1)
        .single()

    if (!config || configError) {
        console.error(`[🧵 Setup] Error creating config`)

        res.status(500)

        if (configError) {
            console.error(`[🧵 Setup] ${configError.message}`)

            res.json({ error: configError.message })
        }

        return
    }

    const { data: userProfile, error: userProfileError } = await supabaseServiceRoleClient
        .from<UserProfile>('squeak_profiles')
        .insert({
            first_name: firstName,
            last_name: lastName,
        })
        .limit(1)
        .single()

    if (!userProfile || userProfileError) {
        console.error(`[🧵 Setup] Error creating user profile`)

        res.status(500)

        if (userProfileError) {
            console.error(`[🧵 Setup] ${userProfileError.message}`)

            res.json({ error: userProfileError.message })
        }

        return
    }

    const { data: userProfileReadonly, error: userProfileReadonlyError } = await supabaseServiceRoleClient
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .insert({
            role: 'admin',
            profile_id: userProfile.id,
            user_id: user.id,
            organization_id: organization.id,
        })
        .limit(1)
        .single()

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
})
