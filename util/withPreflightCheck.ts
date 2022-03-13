import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

import { definitions } from '../@types/supabase'
import { createClient } from '@supabase/supabase-js'
import { getUser, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'

type Config = definitions['squeak_config']
type UserReadonlyProfile = definitions['squeak_profiles_readonly']

interface Arguments<P> {
    redirectTo: string
    authRedirectTo?: string
    authCheck?: boolean
    getServerSideProps: GetServerSideProps<P>
}

const withAdminAccess = <P>(arg: Arguments<P>) => {
    return async (context: GetServerSidePropsContext) => {
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
            const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

            const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

            const { data: config } = await supabaseClient
                .from<Config>('squeak_config')
                .select(`preflight_complete`)
                .eq('id', 1)
                .single()

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
                    .eq('id', user?.id)
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

export default withAdminAccess
