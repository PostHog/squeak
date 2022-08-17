import withMultiTenantCheck from '../../util/withMultiTenantCheck'
import { createUser, UserRoles } from '../../db'
import { setLoginSession } from '../../lib/auth'

interface SignupRequestPayload {
    email: string
    password: string
}

export interface SignupResponsePayload {
    userId: string
}

// This API route is for user signup for a multi tenant application.
// It only handles email and password. Profile creation is handled by /api/user-setup
export default withMultiTenantCheck(async (req, res) => {
    const { email, password }: SignupRequestPayload = req.body

    if (!email || !password || email === '' || password === '') {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const user = await createUser(email, password, UserRoles.admin)

    if (!user) {
        console.error(`[🧵 Signup] Error creating user`)

        res.status(400).json({ error: 'Error creating user' })

        return
    }

    await setLoginSession(res, user.id)

    res.status(201).json({ userId: user.id })
})
