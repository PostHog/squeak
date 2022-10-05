import { Organization, SqueakConfig } from '@prisma/client'
import prisma from '../lib/db'

export async function createOrganization(name: string, url: string): Promise<Organization | null> {
    const organization = await prisma.organization.create({
        data: {
            name,
        },
    })

    if (!organization) return null

    const config: SqueakConfig = await prisma.squeakConfig.create({
        data: {
            organization_id: organization.id,
            preflight_complete: true,
            company_domain: url,
            company_name: name,
        },
    })

    if (!config) return null

    return organization
}

export async function getOrganizationIdFromUser(id: string): Promise<string | undefined | null> {
    const profile = await prisma.profile.findFirst({ where: { user_id: id } })
    return profile?.organization_id
}
