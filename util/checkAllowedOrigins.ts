import type { NextApiRequest } from 'next'
import { getAllowedOrigins } from '../db/squeak_config'
import { Prisma } from '@prisma/client'

interface Response {
    error?: {
        message: string
        statusCode: number
    }
}

const checkAllowedOrigins = async (req: NextApiRequest): Promise<Response> => {
    const host = req.headers.host
    const origin = req.headers.origin

    // If we are in development, we allow the request
    if (process.env.NODE_ENV === 'development') return {}

    // If we can't determine an origin, we allow the request.
    if (!origin) return {}

    // Allow the host (the admin app) to make requests without origin checks.
    if (host && origin.includes(host)) return {}

    const { organizationId } = req.body

    if (!organizationId) {
        return { error: { statusCode: 400, message: 'Missing required parameter - organizationId' } }
    }

    // Lookup config
    try {
        const config: { allowed_origins: string[] } | null = await getAllowedOrigins(organizationId)

        if (!config) {
            return { error: { statusCode: 500, message: 'Error fetching config for organization' } }
        }

        // If there are no allowed origins, we allow the request
        if (!config.allowed_origins || config.allowed_origins.length === 0) {
            return {}
        }

        // If the origin is not in the allowed origins list, we return an error
        if (!config.allowed_origins.includes(origin)) {
            return { error: { statusCode: 403, message: 'Origin not allowed' } }
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return { error: { statusCode: 500, message: `[${error.code}]: ${error.message}` } }
        }

        return { error: { statusCode: 500, message: `Unexpected error: ${error}` } }
    }

    // We allow the request by default
    return {}
}

export default checkAllowedOrigins
