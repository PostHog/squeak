import { Prisma, SqueakConfig } from '@prisma/client'
import prisma from '../lib/db'

/**
 * Returns the allowed_origins property for a squeak_config for a given org id.
 * @param  {string} organizationId
 */
export function getAllowedOrigins(organizationId: string) {
    return prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
        select: { allowed_origins: true },
    })
}

export function getConfig(organizationId: string, select: Prisma.SqueakConfigSelect) {
    return prisma.squeakConfig.findFirst({
        where: { organization_id: organizationId },
        select,
    })
}

export async function updateSqueakConfig(organizationId: string, data: object): Promise<SqueakConfig> {
    // we have to find the config first associated with this organizationId, due to a limitation in
    // prisma's type def schemas
    const config = await prisma.squeakConfig.findFirst({ where: { organization_id: organizationId } })

    return prisma.squeakConfig.update({
        where: { id: config?.id },
        data: data,
    })
}
