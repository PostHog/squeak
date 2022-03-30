import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

import { definitions } from '../@types/supabase'
import { createClient } from '@supabase/supabase-js'
import { getUser, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

type Config = definitions['squeak_config']
type UserReadonlyProfile = definitions['squeak_profiles_readonly']

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

            const { data: config } = await getConfig()

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

                const { data: config } = await getConfig()

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
                    const { user } = await getUser(context)

                    if (!user) {
                        return {
                            redirect: {
                                destination: authRedirectTo,
                                permanent: false,
                            },
                        }
                    }

                    const { data: userReadonlyProfile } = await supabaseServerClient(context)
                        .from<UserReadonlyProfile>('squeak_profiles_readonly')
                        .select('role')
                        .eq('user_id', user?.id)
                        .single()

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    return await supabaseClient.from<Config>('squeak_config').select(`preflight_complete`).single()
}

export default withPreflightCheck
