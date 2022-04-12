import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../../../@types/supabase'

type ProfileReadonly = definitions['squeak_profiles_readonly']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { token, organizationId } = JSON.parse(req.body)

    if (!token || !organizationId) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const { user } = await supabaseServerClient({ req, res }).auth.api.getUser(token)

    if (!user) {
        console.error(`[🧵 Check] Error fetching user profile from token`)
        res.status(500).json({ error: 'Error fetching user profile from token' })
        return
    }

    const { error } = await supabaseServerClient({ req, res })
        .from<ProfileReadonly>('squeak_profiles_readonly')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .limit(1)
        .single()

    res.status(200).json({ hasProfile: !error })
}

export default handler
