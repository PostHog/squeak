import type { GetServerSidePropsContext, GetServerSidePropsResult, NextApiRequest, NextApiResponse } from 'next'

import prisma from '../lib/db'
import { getUserRole } from '../db/profiles'
import { getSessionUser, SafeUser } from '../lib/auth'

export const withAdminApiHandler =
    (
        handler: (req: NextApiRequest, res: NextApiResponse, user: SafeUser) => unknown | Promise<unknown>
    ): unknown | Promise<unknown> =>
    async (req: NextApiRequest, res: NextApiResponse) => {
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

            const user: SafeUser | null = await getSessionUser(req)

            if (!user) {
                res.status(403).send({
                    message: 'User is not logged in',
                })
                return
            }

            const userReadonlyProfile = await getUserRole(user.organizationId, user.id)

            if (!userReadonlyProfile) {
                console.log('no readonly profile', user)

                res.status(403).send({
                    message: 'User is not logged in',
                })
                return
            }

            if (userReadonlyProfile.role !== 'admin') {
                res.status(403).send({
                    message: 'User does not have the correct privileges',
                })
                return
            }

            return await handler(req, res, user)
        } catch (error) {
            console.error(error)

            res.status(500)
            return
        }
    }

export const withAdminGetStaticProps = <P extends { [key: string]: any }>(arg: {
    redirectTo: (url: string) => string
    getServerSideProps: (context: GetServerSidePropsContext, user: SafeUser) => Promise<GetServerSidePropsResult<P>>
}) => {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
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

            if (!user) {
                return {
                    redirect: {
                        destination: arg.redirectTo && arg.redirectTo(context.resolvedUrl),
                        permanent: false,
                    },
                }
            }

            const userReadonlyProfile = await getUserRole(user.organizationId, user.id)

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
                    redirect: {
                        destination: arg.redirectTo && arg.redirectTo(context.resolvedUrl),
                        permanent: false,
                    },
                }
            }

            return await arg.getServerSideProps(context, user)
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
