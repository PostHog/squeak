import type { GetServerSidePropsContext, NextApiResponse } from 'next'
import nookies from 'nookies'
import { NextApiRequest } from 'next'

type Context =
    | GetServerSidePropsContext
    | {
          req: NextApiRequest
      }

const getActiveOrganization = (context: Context): string => {
    const { squeak_organization_id } = nookies.get(context)

    return squeak_organization_id
}

export function clearOrganization(res: NextApiResponse) {
    nookies.destroy({ res }, 'squeak_organization_id')
}

export default getActiveOrganization
