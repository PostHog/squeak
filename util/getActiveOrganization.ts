import type { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'

const getActiveOrganization = (context: GetServerSidePropsContext) => {
    const { squeak_organization_id } = nookies.get(context)

    return squeak_organization_id
}

export default getActiveOrganization
