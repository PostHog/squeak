import { SafeUser } from '../lib/auth'

declare module 'next' {
    export interface NextApiRequest {
        user?: SafeUser
    }
}
