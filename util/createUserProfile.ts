import prisma from '../lib/db'
import { Prisma, Profile } from '@prisma/client'

interface Result {
    data?: Profile
    error?: Error
}

const createUserProfile = async (
    params: Prisma.XOR<Prisma.ProfileCreateInput, Prisma.ProfileUncheckedCreateInput>
): Promise<Result> => {
    try {
        const data = await prisma.profile.create({
            data: params,
        })

        if (!data) return { error: new Error('Failed to create profile') }
        return { data }
    } catch (error) {
        return { error: new Error('Failed to create profile') }
    }
}

export default createUserProfile
