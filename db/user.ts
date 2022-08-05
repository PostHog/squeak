import { ProfileReadonly, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

import prisma from '../lib/db'

export enum UserRoles {
    admin = 'admin',
    authenticated = 'authenticated',
}

/**
 * Find a user by id
 *
 * @param  {string} id
 * @returns Promise<User | null>
 */
export function getUser(id: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: { id },
    })
}

export function findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
        where: { email: email.toLowerCase() },
    })
}

export function getReadonlyProfileForUser(userId: string, organizationId: string): Promise<ProfileReadonly | null> {
    return prisma.profileReadonly.findFirst({
        where: { user_id: userId, organization_id: organizationId },
    })
}

/**
 * Create a new user account from an email and plaintext password.
 *
 * @param  {string} email
 * @param  {string} password
 * @returns Promise
 */
export async function createUser(email: string, password: string, role: UserRoles): Promise<User> {
    const salt = await bcrypt.genSalt(10)
    const encryptedPassword = await bcrypt.hash(password, salt)

    return prisma.user.create({
        data: {
            email: email.toLowerCase(),
            encrypted_password: encryptedPassword,
            role,
            id: randomUUID(),
            confirmation_token: randomUUID(),
            confirmation_sent_at: new Date(),
        },
    })
}

export async function inviteUser(email: string) {
    return prisma.user.create({
        data: {
            email: email.toLowerCase(),
            encrypted_password: '',
            role: 'authenticated',
            confirmation_token: randomUUID(),
            confirmation_sent_at: new Date(),
            id: randomUUID(),
        },
    })
}

export function findUserByConfirmationToken(token: string) {
    return prisma.user.findFirst({
        where: { confirmation_token: token },
    })
}

export async function confirmUser(user: User) {
    return prisma.user.update({
        where: { id: user.id },
        data: {
            email_confirmed_at: new Date(),
            confirmation_token: null,
        },
    })
}

export async function updateUserPassword(user: User, password: string) {
    const salt = await bcrypt.genSalt(10)
    const encrypted = await bcrypt.hash(password, salt)
    return prisma.user.update({
        where: { id: user.id },
        data: { encrypted_password: encrypted },
    })
}

/**
 * Given an email and password, verify that a user with the email exists, and the password matches
 * the hashed password in the database
 *
 * @param  {string} email
 * @param  {string} password the plaintext password challenge
 * @return {Promise<User>}
 */
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
    try {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        // Currently there are no users without passwords, but eventually we'll have users authenticated via
        // oauth sources, so we need to check for that
        if (!user.encrypted_password) return null

        const match = await bcrypt.compare(password, user.encrypted_password)
        return match ? user : null
    } catch (e) {
        console.error('ERROR: ', e)
        return null
    }
}
