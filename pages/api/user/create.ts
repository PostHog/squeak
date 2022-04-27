import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { definitions } from '../../../@types/supabase'
import createUserProfile from '../../../util/createUserProfile'
import createUserProfileReadonly from '../../../util/createUserProfileReadonly'

type ProfileReadonly = definitions['squeak_profiles_readonly']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { first_name, last_name, avatar, slack_user_id, organization_id } = JSON.parse(req.body)

    if (!first_name) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    let profileId

    const { data, error } = await supabaseServerClient({ req, res })
        .from<ProfileReadonly>('squeak_profiles_readonly')
        .select('profile_id')
        .eq('slack_user_id', slack_user_id)
        .single()

    if (data?.profile_id) {
        profileId = data.profile_id
    } else {
        const { data: profile, error: profileError } = await createUserProfile(first_name, last_name, avatar)

        const { data: profileReadOnly, error: profileReadOnlyError } = await createUserProfileReadonly(
            null,
            organization_id,
            profile?.id || '',
            'user',
            slack_user_id
        )

        profileId = profile?.id
    }

    res.status(200).json({ profileId })
}

export default handler
