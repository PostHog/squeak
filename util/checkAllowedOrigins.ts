import type { NextApiRequest } from 'next'
import { definitions } from '../@types/supabase'
import { createClient } from '@supabase/supabase-js'

type Config = definitions['squeak_config']

interface Response {
    error?: {
        message: string
        statusCode: number
    }
}

const checkAllowedOrigins = async (req: NextApiRequest): Promise<Response> => {
    const origin = req.headers.origin

    // If we are in development, we allow the request
    if (process.env.NODE_ENV === 'development') {
        return {}
    }

    // If we can't determine an origin, we allow the request.
    if (!origin) {
        return {}
    }

    // Get a service role Supabase client, so we can fetch the config
    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const { organizationId } = JSON.parse(req.body)

    if (!organizationId) {
        return { error: { statusCode: 400, message: 'Missing required parameter - organizationId' } }
    }

    // Lookup config
    const { data, error } = await supabaseServiceRoleClient
        .from<Config>('squeak_config')
        .select('allowed_origins')
        .eq('organization_id', organizationId)
        .limit(1)
        .single()

    console.log('Got the config')

    // If there was an error fetching the config, we return the error
    if (!data || error) {
        return { error: { statusCode: 500, message: error ? error.message : 'Error fetching config for organization' } }
    }

    // If there are no allowed origins, we allow the request
    if (!data.allowed_origins || data.allowed_origins.length === 0) {
        return {}
    }

    // If the origin is not in the allowed origins list, we return an error
    if (!data.allowed_origins.includes(origin)) {
        return { error: { statusCode: 403, message: 'Origin not allowed' } }
    }

    // We allow the request by default
    return {}
}

export default checkAllowedOrigins
