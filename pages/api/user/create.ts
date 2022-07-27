import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db'
import createUserProfile from '../../../util/createUserProfile'
import createUserProfileReadonly from '../../../util/createUserProfileReadonly'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { first_name, last_name, avatar, slack_user_id, organization_id } = JSON.parse(req.body)

    if (!first_name) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    let profileId

    const data = await prisma.profileReadonly.findFirst({
        where: { slack_user_id },
        select: { profile_id: true },
    })

    if (data?.profile_id) {
        profileId = data.profile_id
    } else {
        const { data: profile } = await createUserProfile({ first_name, last_name, avatar })

        await createUserProfileReadonly(null, organization_id, profile?.id || '', 'user', slack_user_id)

        profileId = profile?.id
    }

    res.status(200).json({ profileId })
}

export default handler
