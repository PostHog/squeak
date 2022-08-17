import { User } from '@prisma/client'
import jwt from 'jsonwebtoken'

export const JWT_SECRET = process.env.JWT_SECRET || 'Dn/6R5A44cZPzdglXmJoT5QmtXcjD0xUc45KcnlRg+o='

export function generateToken(user: User) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            app_metadata: {
                provider: 'email',
            },
            role: 'authenticated',
        },
        JWT_SECRET,
        {
            expiresIn: '30d',
            algorithm: 'HS256',
            issuer: 'squeak.cloud',
            audience: 'authenticated',
        }
    )
}
