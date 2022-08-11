import Ajv, { Options as AjvOptions } from 'ajv'
import { NextApiRequest, NextApiResponse } from 'next'

export function validateBody(schema: object, ajvOptions?: AjvOptions) {
    const ajv = new Ajv(ajvOptions)
    const validate = ajv.compile(schema)

    return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
        const valid = validate(req.body)
        if (valid) {
            return next()
        }

        if (validate.errors?.[0]) {
            const error = validate.errors[0]
            return res.status(400).json({
                error: `"${error.instancePath.substring(1)}" ${error.message}`,
            })
        }

        return res.status(500).json({ error: 'Unknown error' })
    }
}
