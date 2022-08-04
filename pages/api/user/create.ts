import { NextApiRequest, NextApiResponse } from 'next'
import { findOrCreateProfileFromSlackUser } from '../../../db/profiles'

export interface UserCreateResponse {
    profileId: string | null
}

// POST /api/user/create
// Create a user profile
// TODO: Remove this import after supabase refactor is deployed. It's no longer used.
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { first_name } = req.body

    if (!first_name) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const profileId = await findOrCreateProfileFromSlackUser(req.body)

    res.status(200).json({ profileId })
}

export default handler
