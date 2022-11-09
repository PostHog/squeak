import { PrismaClient } from '@prisma/client'
import { UserRoles } from '../src/db/user'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
    const salt = await bcrypt.genSalt(10)

    const encryptedPassword = await bcrypt.hash('12345678', salt)

    const user = await prisma.user.upsert({
        where: { email: 'test@posthog.com' },
        update: {},
        create: {
            id: randomUUID(),
            email: 'test@posthog.com',
            encrypted_password: encryptedPassword,
            confirmation_token: randomUUID(),
            confirmation_sent_at: new Date(),
        },
    })

    // Create the organization
    const organization = await prisma.organization.create({
        data: { name: 'Test Organization' },
    })

    // Create the squeak_config entry for the organization
    await prisma.squeakConfig.create({
        data: {
            organization_id: organization.id,
            preflight_complete: true,
            company_domain: 'https://posthog.com',
            company_name: 'Test Organization',
        },
    })

    await prisma.profile.create({
        data: {
            first_name: 'First',
            last_name: 'Last',
            role: UserRoles.admin,
            user_id: user.id,
            organization_id: organization.id,
        },
    })

    await prisma.team.create({
        data: {
            name: 'Website',
            organization_id: organization.id,
        },
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
