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
import { User } from '@prisma/client'
import { getSessionUser } from '../lib/auth'

type Args =
    | {
          redirectTo?: (url: string) => string
          getServerSideProps?: GetServerSideProps
      }
    | NextApiHandler

const withAdminAccess = (arg: Args) => {
    if (typeof arg === 'function') {
        return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
            const organizationId = getActiveOrganization({ req, res })
            const user: User | null = await getSessionUser(req)
            // console.log('session=', session)

            if (!user) {
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

                const user: User | null = await getSessionUser(context.req)
                const organizationId = getActiveOrganization(context)

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
