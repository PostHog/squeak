import { createClient } from '@supabase/supabase-js'
import { getUser } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../../../@types/supabase'
import withMultiTenantCheck from '../../../util/withMultiTenantCheck'

type Organization = definitions['squeak_organizations']
type UserProfile = definitions['squeak_profiles']
type UserProfileReadonly = definitions['squeak_profiles_readonly']

export default withMultiTenantCheck(async (req, res) => {
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

    const { firstName, lastName, organizationName } = JSON.parse(req.body)

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

    const { data: userProfile, error: userProfileError } = await supabaseServiceRoleClient
        .from<UserProfile>('squeak_profiles')
        .insert({
            first_name: firstName,
            last_name: lastName,
            user_id: user.id,
        })
        .limit(1)
        .single()

    if (!userProfile || userProfileError) {
        console.error(`[🧵 Signup] Error creating user profile`)

        res.status(500)

        if (userProfileError) {
            console.error(`[🧵 Signup] ${userProfileError.message}`)

            res.json({ error: userProfileError.message })
        }

        return
    }

    const { data: userProfileReadonly, error: userProfileReadonlyError } = await supabaseServiceRoleClient
        .from<UserProfileReadonly>('squeak_profiles_readonly')
        .insert({
            role: 'admin',
            user_id: user.id,
            organisation_id: organization.id,
        })
        .limit(1)
        .single()

    if (!userProfileReadonly || userProfileReadonlyError) {
        console.error(`[🧵 Signup] Error creating user readonly profile`)

        res.status(500)

        if (userProfileReadonlyError) {
            console.error(`[🧵 Signup] ${userProfileReadonlyError.message}`)

            res.json({ error: userProfileReadonlyError.message })
        }

        return
    }

    res.status(200).json({ userId: user.id, firstName, lastName, organizationName })
})
