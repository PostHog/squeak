import { JSONSchemaType } from 'ajv'
import { randomUUID } from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'
import absoluteUrl from 'next-absolute-url'
import nextConnect from 'next-connect'

import prisma from '../../../lib/db'
import { sendForgotPassword } from '../../../lib/email'
import { corsMiddleware, validateBody } from '../../../lib/middleware'

interface ForgotPasswordRequestParams {
    email: string
    redirect: string
    organizationId: string
}

const schema: JSONSchemaType<ForgotPasswordRequestParams> = {
    type: 'object',
    properties: {
        email: { type: 'string' },
        redirect: { type: 'string' },
        organizationId: { type: 'string' },
    },
    required: ['email'],
}

const handler = nextConnect().use(corsMiddleware).use(validateBody(schema)).post(doPost)

async function doPost(req: NextApiRequest, res: NextApiResponse) {
    const { email, redirect, organizationId } = req.body

    let user = await prisma.user.findFirst({
        where: { email },
    })

    if (!user) {
        return res.status(200).json({ success: true })
    }

    user = await prisma.user.update({
        where: { id: user.id },
        data: {
            recovery_token: randomUUID(),
            recovery_sent_at: new Date(),
        },
    })

    const { origin } = absoluteUrl(req)
    let confirmationUrl = `${origin}/reset-password?token=${user.recovery_token}`
    if (redirect) confirmationUrl += '&redirect=' + redirect

    await sendForgotPassword(user, confirmationUrl, organizationId)

    res.status(200).json({ success: true })
}

export default handler
