import { createClient } from '@supabase/supabase-js'
import NextCors from 'nextjs-cors'
import checkAllowedOrigins from '../../../util/checkAllowedOrigins'

const handler = async (req, res) => {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
    })

    const { error: allowedOriginError } = await checkAllowedOrigins(req)

    if (allowedOriginError) {
        res.status(allowedOriginError.statusCode).json({ error: allowedOriginError.message })
        return
    }

    const { organizationId } = JSON.parse(req.body)

    if (!organizationId) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const supabaseServiceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: topics, error: topicsError } = await supabaseServiceRoleClient
        .from('squeak_topics')
        .select('label')
        .eq('organization_id', organizationId)

    if (!topics || topicsError) {
        console.error(`[🧵 Topics] Error fetching topics`)
        res.status(500)

        if (topicsError) {
            console.error(`[🧵 Topics] ${configError.message}`)
            res.json({ error: topicsError.message })
        }

        return
    }

    res.status(200).json(topics)
}

export default handler
