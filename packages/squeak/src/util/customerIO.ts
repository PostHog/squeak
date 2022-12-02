import { NextApiResponse } from 'next'
import { SafeUser } from 'src/lib/auth'
import prisma from 'src/lib/db'
const { TrackClient, RegionUS } = require('customerio-node')

export const addPersonToCustomerIO = async ({ res, user }: { res: NextApiResponse; user: SafeUser }) => {
    const config = await prisma.squeakConfig.findFirst({
        where: { organization_id: user?.organizationId },
        select: {
            customer_io_app_api_key: true,
            customer_io_broadcast_id: true,
            customer_io_site_id: true,
            customer_io_tracking_api_key: true,
            customer_io_segment_id: true,
        },
    })

    if (!config?.customer_io_site_id || !config.customer_io_tracking_api_key)
        return res.status(500).json({ error: 'Customer IO settings not found' })

    const profile = await prisma.profile.findFirst({
        where: { id: user?.profileId },
    })

    if (!profile) return res.status(500).json({ error: 'User profile not found' })

    const cio = new TrackClient(config?.customer_io_site_id, config?.customer_io_tracking_api_key, { region: RegionUS })

    // Creates new person in Customer IO if one doesn't exist
    await cio
        .identify(user?.email, {
            first_name: profile.first_name,
            last_name: profile.last_name,
        })
        .catch((err) => console.log(err))

    if (config?.customer_io_segment_id) {
        const auth = new Buffer(`${config?.customer_io_site_id}:${config?.customer_io_tracking_api_key}`).toString(
            'base64'
        )
        await fetch(
            `https://track.customer.io/api/v1/segments/${config?.customer_io_segment_id}/add_customers?id_type=email`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Basic ${auth}`,
                },
                body: JSON.stringify({
                    ids: [user?.email],
                }),
            }
        ).catch((err) => console.error(err))
    }
}
