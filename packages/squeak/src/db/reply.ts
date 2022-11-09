import { Prisma, Profile, Reply } from '@prisma/client'
import prisma from '../lib/db'

export function updateRepliesPublished(
    id: number | bigint,
    published: boolean | Prisma.BoolFieldUpdateOperationsInput
) {
    return prisma.reply.update({
        where: { id },
        data: { published },
    })
}

export async function createReply(
    organizationId: string,
    body: string,
    messageId: bigint,
    userProfile: Profile
): Promise<Reply> {
    const config = await prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
        select: { reply_auto_publish: true },
    })

    if (!config) {
        throw new Error('Error fetching config')
    }

    return await prisma.reply.create({
        data: {
            body: body,
            message_id: messageId,
            organization_id: organizationId,
            profile_id: userProfile.id,
            published: config.reply_auto_publish,
        },
    })
}
