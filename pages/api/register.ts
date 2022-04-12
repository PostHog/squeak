import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import createUserProfile from '../../util/createUserProfile'
import createUserProfileReadonly from '../../util/createUserProfileReadonly'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'

// This API route is for registering a new user from the JS snippet.
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { error: allowedOriginError } = await checkAllowedOrigins(req)

    if (allowedOriginError) {
        res.status(allowedOriginError.statusCode).json({ error: allowedOriginError.message })
        return
    }

    const { token, organizationId, firstName, lastName, avatar } = JSON.parse(req.body)

    if (!organizationId || !token) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const { user, error: userError } = await supabaseServerClient({ req, res }).auth.api.getUser(token)

    if (!user || userError) {
        console.error(`[🧵 Register] Error fetching user profile`)
        res.status(500)

        if (userError) {
            console.error(`[🧵 Register] ${userError.message}`)
            res.json({ error: userError.message })
        }

        return
    }

    const { data: userProfile, error: userProfileError } = await createUserProfile(firstName, lastName, avatar)

    if (!userProfile || userProfileError) {
        console.error(`[🧵 Register] Error creating user profile`)

        res.status(500)

        if (userProfileError) {
            console.error(`[🧵 Register] ${userProfileError.message}`)

            res.json({ error: userProfileError.message })
        }

        return
    }

    const { data: userProfileReadonly, error: userProfileReadonlyError } = await createUserProfileReadonly(
        user.id,
        organizationId,
        userProfile.id,
        'user'
    )

    if (!userProfileReadonly || userProfileReadonlyError) {
        console.error(`[🧵 Register] Error creating user readonly profile`)

        res.status(500)

        if (userProfileReadonlyError) {
            console.error(`[🧵 Register] ${userProfileReadonlyError.message}`)

            res.json({ error: userProfileReadonlyError.message })
        }

        return
    }

    res.status(200).json({
        userId: user.id,
        profileId: userProfile.id,
        firstName,
        lastName,
        avatar,
        organizationId: organizationId,
    })
}

export default handler
