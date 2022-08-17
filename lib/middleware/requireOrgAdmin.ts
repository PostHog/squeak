import { NextApiRequest, NextApiResponse } from 'next'

import { requireOrgAdmin as checkOrgAdmin } from '../api/apiUtils'

export async function requireOrgAdmin(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    if (!(await checkOrgAdmin(req, res))) return

    next()
}
