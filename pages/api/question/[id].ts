import { JSONSchemaType } from 'ajv'
import { NextApiRequest, NextApiResponse } from 'next'
import { deleteQuestion, getQuestion } from '../../../db/question'

import { updateQuestion } from '../../../db/question'
import { requireOrgAdmin, safeJson } from '../../../lib/api/apiUtils'
import { validateBody } from '../../../lib/middleware'
import nextConnect from 'next-connect'
import getActiveOrganization from '../../../util/getActiveOrganization'

export interface UpdateQuestionRequestPayload {
    subject: string | null
    published: boolean
    resolved: boolean
    replyId: number
    permalink: string | null
}

const updateSchema: JSONSchemaType<UpdateQuestionRequestPayload> = {
    type: 'object',
    properties: {
        subject: { type: 'string', nullable: true },
        published: { type: 'boolean' },
        resolved: { type: 'boolean' },
        replyId: { type: 'number' },
        permalink: { type: 'string', nullable: true },
    },
    required: [],
    additionalProperties: true,
}

const handler = nextConnect<NextApiRequest, NextApiResponse>()
    .patch(validateBody(updateSchema, { coerceTypes: true }), doUpdateQuestion)
    .delete(doDeleteQuestion)
    .get(doGetQuestion)

// GET /api/question/[id]
async function doGetQuestion(req: NextApiRequest, res: NextApiResponse) {
    const id = parseInt(req.query.id as string)

    // allow the client to specify which fields to select from the db and return
    const fields = req.query.fields as string
    const question = await getQuestion(id, { fields })

    safeJson(res, question)
}

// DELETE /api/question/[id]
async function doDeleteQuestion(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return

    const id = parseInt(req.query.id as string)

    await deleteQuestion(id)

    res.status(200).json({ success: true })
}

// PATCH /api/question/[id]
export async function doUpdateQuestion(req: NextApiRequest, res: NextApiResponse) {
    if (!(await requireOrgAdmin(req, res))) return
    const organizationId = getActiveOrganization({ req, res })

    const id = parseInt(req.query.id as string)

    const params: UpdateQuestionRequestPayload = req.body
    try {
        const question = await updateQuestion(id, organizationId, params)
        safeJson(res, question)
    } catch (err) {
        if (err instanceof Error) {
            res.status(422).json({ error: err.message })
        }
    }
}

export default handler
