import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

import { getUser, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../@types/supabase'
import { createClient } from '@supabase/supabase-js'
import type { GetServerSideProps, NextApiHandler } from 'next'

type Config = definitions['squeak_config']
type UserReadonlyProfile = definitions['squeak_profiles_readonly']

type Args =
    | {
          redirectTo?: string
          getServerSideProps?: GetServerSideProps
      }
    | NextApiHandler

const withAdminAccess = (arg: Args) => {
    if (typeof arg === 'function') {
        return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
            const { user } = await getUser({ req, res })

            if (!user) {
                res.status(401).json({
                    error: 'not_authenticated',
                    description: 'The user does not have an active session or is not authenticated',
                })
                return
            }

            const { data: userReadonlyProfile } = await supabaseServerClient({ req, res })
                .from<UserReadonlyProfile>('squeak_profiles_readonly')
                .select('role')
                .eq('user_id', user?.id)
                .single()

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
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
                const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

                const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

                const isMultiTenancy = process.env.MULTI_TENANCY ?? false

                if (!isMultiTenancy) {
                    const { data: config } = await supabaseClient
                        .from<Config>('squeak_config')
                        .select(`preflight_complete`)
                        .limit(1)
                        .single()

                    if (!config || !config?.preflight_complete) {
                        return {
                            redirect: {
                                destination: '/setup/welcome',
                                permanent: false,
                            },
                        }
                    }
                }

                const { user } = await getUser(context)

                if (!user) {
                    return {
                        redirect: {
                            destination: arg.redirectTo,
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
                            destination: arg.redirectTo,
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
                    return await arg.getServerSideProps(context)
                }

                return {
                    props: {},
                }
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

export default withAdminAccess
