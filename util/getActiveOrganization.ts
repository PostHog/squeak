import type { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'
import { NextApiRequest, NextApiResponse } from 'next'

type Context =
    | GetServerSidePropsContext
    | {
          req: NextApiRequest
          res: NextApiResponse
      }

const getActiveOrganization = (context: Context) => {
    const { squeak_organization_id } = nookies.get(context)

    return squeak_organization_id
}

export default getActiveOrganization
