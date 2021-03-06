import { getUser, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { createClient } from '@supabase/supabase-js'
import type {
    GetServerSideProps,
    GetServerSidePropsContext,
    NextApiHandler,
    NextApiRequest,
    NextApiResponse,
} from 'next'
import { definitions } from '../@types/supabase'
import getActiveOrganization from './getActiveOrganization'

type Config = definitions['squeak_config']
type UserReadonlyProfile = definitions['squeak_profiles_readonly']

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
                .eq('organization_id', organizationId)
                .limit(1)
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
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
                const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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
                const organizationId = getActiveOrganization(context)

                if (!user) {
                    return {
                        redirect: {
                            destination: arg.redirectTo && arg.redirectTo(context.resolvedUrl),
                            permanent: false,
                        },
                    }
                }

                const { data: userReadonlyProfile } = await supabaseServerClient(context)
                    .from<UserReadonlyProfile>('squeak_profiles_readonly')
                    .select('role')
                    .eq('user_id', user?.id)
                    .eq('organization_id', organizationId)
                    .limit(1)
                    .single()

                if (!userReadonlyProfile) {
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
                    return await arg.getServerSideProps(context)
                }

                return {
                    props: {},
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
