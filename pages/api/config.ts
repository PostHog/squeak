import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import checkAllowedOrigins from '../../util/checkAllowedOrigins'

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

    const params = JSON.parse(req.body)

    if (!params.organizationId) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: config } = await supabaseServiceRoleClient
        .from('squeak_config')
        .select('permalink_base, permalinks_enabled')
        .eq('organization_id', params.organizationId)
        .single()

    res.status(200).json(config)
}

export default handler
