import { getImage } from 'src/util/formidable'
import { uploadImage } from 'src/util/cloudinary'
import prisma from '../../lib/db'
import { orgIdNotFound, requireOrgAdmin } from 'src/lib/api/apiUtils'
import { getSessionUser } from 'src/lib/auth'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handle(req, res) {
    if (!(await requireOrgAdmin(req, res))) return
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
        },
    })

    res.json(result)
}
