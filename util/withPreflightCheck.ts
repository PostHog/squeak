import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import prisma from '../lib/db'
import { getSessionUser } from '../lib/auth'

type Args<P> =
    | {
          redirectTo: string
          authRedirectTo?: string
          authCheck?: boolean
          getServerSideProps: GetServerSideProps<P>
      }
    | NextApiHandler

const withPreflightCheck = <P>(arg: Args<P>) => {
    if (typeof arg === 'function') {
        return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
            const isMultiTenancy = process.env.MULTI_TENANCY ?? false

            if (isMultiTenancy) {
                res.status(404).json({
                    error: 'not_found',
                    description: 'The requested resource was not found',
                })
                return
            }

            const config = await getConfig()

            if (config && config.preflight_complete) {
                res.status(404).json({
                    error: 'not_found',
                    description: 'The requested resource was not found',
                })
            }

            await arg(req, res)
        }
    } else {
        return async (context: GetServerSidePropsContext) => {
            try {
                const isMultiTenancy = process.env.MULTI_TENANCY ?? false

                if (isMultiTenancy) {
                    return {
                        props: {
                            error: {
                                statusCode: 404,
                                message: 'The requested page is only available for self-hosted sites',
                            },
                        },
                    }
                }

                const config = await getConfig()

                if (config && config.preflight_complete) {
                    return {
                        redirect: {
                            destination: arg.redirectTo,
                            permanent: false,
                        },
                    }
                }

                const { authCheck = false, authRedirectTo = '/setup/administration' } = arg

                if (authCheck) {
                    const user = await getSessionUser(context.req)

                    if (!user) {
                        return {
                            redirect: {
                                destination: authRedirectTo,
                                permanent: false,
                            },
                        }
                    }

                    const userReadonlyProfile = await prisma.profileReadonly.findFirst({
                        where: { user_id: user.id },
                        select: { role: true },
                    })

                    if (!userReadonlyProfile) {
                        return {
                            redirect: {
                                destination: authRedirectTo,
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
                }

                return await arg.getServerSideProps(context)
            } catch (error) {
                return {
                    redirect: {
                        destination: arg.redirectTo,
                        permanent: false,
                    },
                }
            }
        }
    }
}

const getConfig = async () => {
    return await prisma.squeakConfig.findFirst({
        select: { preflight_complete: true },
    })
}

export default withPreflightCheck
