import { getImage } from 'src/util/formidable'
import { uploadImage } from 'src/util/cloudinary'
import prisma from '../../lib/db'
import { orgIdNotFound, requireOrgAdmin } from 'src/lib/api/apiUtils'
import { getSessionUser } from 'src/lib/auth'
import nextConnect from 'next-connect'
import { NextApiRequest, NextApiResponse } from 'next'
import { allowedOrigin, corsMiddleware } from 'src/lib/middleware'

export const config = {
    api: {
        bodyParser: false,
    },
}

const handler = nextConnect<NextApiRequest, NextApiResponse>().use(corsMiddleware).use(allowedOrigin).post(createImage)

async function createImage(req, res) {
    const user = await getSessionUser(req)

    if (!user) return orgIdNotFound(res)

    const config = await prisma.squeakConfig.findFirst({
        where: { organization_id: user?.organizationId },
        select: {
            cloudinary_cloud_name: true,
            cloudinary_api_key: true,
            cloudinary_api_secret: true,
        },
    })

    if (!config || !config.cloudinary_api_key || !config.cloudinary_api_secret || !config.cloudinary_cloud_name)
        return res.status(500)

    const imageUploaded = await getImage(req)

    const imageData = await uploadImage(imageUploaded.filepath, {
        cloud_name: config.cloudinary_cloud_name,
        api_key: config.cloudinary_api_key,
        api_secret: config.cloudinary_api_secret,
    })

    const result = await prisma.image.create({
        data: {
            cloud_name: config.cloudinary_cloud_name,
            organization_id: user?.organizationId,
            publicId: imageData.public_id,
            format: imageData.format,
            version: imageData.version.toString(),
            user_id: user.id,
        },
    })

    res.json(result)
}

export default handler
