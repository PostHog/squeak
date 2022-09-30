import type {
    GetServerSideProps,
    GetServerSidePropsContext,
    NextApiHandler,
    NextApiRequest,
    NextApiResponse,
} from 'next'

import getActiveOrganization from './getActiveOrganization'
import prisma from '../lib/db'
import { getUserRole } from '../db/profiles'
import { getSessionUser, SafeUser, setOrgIdCookie } from '../lib/auth'

type Args =
    | {
          redirectTo?: (url: string) => string
          getServerSideProps?: GetServerSideProps
      }
    | NextApiHandler

const withAdminAccess = (arg: Args) => {
    if (typeof arg === 'function') {
        return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
            let organizationId = getActiveOrganization({ req, res })
            const user: SafeUser | null = await getSessionUser(req)

            if (!organizationId) {
                const ro = await prisma.profileReadonly.findFirstOrThrow({
                    where: { user_id: user?.id },
                })
                organizationId = ro.organization_id
                setOrgIdCookie(res, organizationId)
            }

            if (!organizationId || !user) {
                res.status(401).json({
                    error: 'not_authenticated',
                    description: 'The user does not have an active session or is not authenticated',
                })
                return
            }

            const userReadonlyProfile = await getUserRole(organizationId, user.id)

            if (!userReadonlyProfile) {
                res.status(401).json({
                    error: 'not_authenticated',
                    description: 'The user does not have an active session or is not authenticated',
                })
            }

            if (userReadonlyProfile?.role !== 'admin') {
                res.status(401).json({
                    error: 'not_authenticated',
                    description: 'The user is not an admin',
                })
            }

            await arg(req, res)
        }
    } else {
        return async (context: GetServerSidePropsContext) => {
            try {
                const isMultiTenancy = process.env.MULTI_TENANCY ?? false

                if (!isMultiTenancy) {
                    const config = await prisma.squeakConfig.findFirst({
                        select: { preflight_complete: true },
                    })

                    if (!config || !config?.preflight_complete) {
                        return {
                            redirect: {
                                destination: '/setup/welcome',
                                permanent: false,
                            },
                        }
                    }
                }

                const user: SafeUser | null = await getSessionUser(context.req)
                let organizationId = getActiveOrganization(context)

                // This is a hack to get around the fact that the organizationId cookie is not set
                // This should never happen, but there was a production bug, so this is preferable
                // to a 500 error
                if (!organizationId) {
                    const ro = await prisma.profileReadonly.findFirstOrThrow({
                        where: { user_id: user?.id },
                    })
                    organizationId = ro.organization_id
                    setOrgIdCookie(context.res as NextApiResponse, organizationId)
                }

                if (!user) {
                    return {
                        redirect: {
                            destination: arg.redirectTo && arg.redirectTo(context.resolvedUrl),
                            permanent: false,
                        },
                    }
                }

                // context.req.user = user

                const userReadonlyProfile = await getUserRole(organizationId, user.id)

                if (!userReadonlyProfile) {
                    console.log('no readonly profile', user)

                    return {
                        redirect: {
                            destination: arg.redirectTo && arg.redirectTo(context.resolvedUrl),
                            permanent: false,
                        },
                    }
                }

                if (userReadonlyProfile.role !== 'admin') {
                    context.res.statusCode = 403
                    return {
                        props: {
                            error: {
                                message: 'You must be an admin to access this page',
                            },
                        },
                    }
                }

                if (arg.getServerSideProps) {
                    const props = await arg.getServerSideProps(context)
                    props['props'] = {
                        ...props['props'],
                        user,
                    }

                    return props
                }

                return {
                    props: {
                        user,
                    },
                }
            } catch (error) {
                return {
                    redirect: {
                        destination: arg.redirectTo && arg.redirectTo(context.resolvedUrl),
                        permanent: false,
                    },
                }
            }
        }
    }
}

export default withAdminAccess
