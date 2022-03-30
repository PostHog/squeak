import { getUser, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { GetStaticPropsResult } from 'next'
import { ReactElement } from 'react'
import { definitions } from '../../@types/supabase'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import CodeSnippet from '../../components/CodeSnippet'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'

type Config = definitions['squeak_config']
type UserProfileReadonly = definitions['squeak_profiles_readonly']

interface Props {}

const Snippet: NextPageWithLayout<Props> = () => {
    return (
        <div>
            <main>
                <CodeSnippet />

                <hr className="mb-6" />

                <h3 className="mt-4">Setup complete</h3>
                <p>Now you can manage users and moderate content in the Squeak! admin portal.</p>

                <Button className="mt-4" href="/">
                    Go to Admin
                </Button>
            </main>
        </div>
    )
}

Snippet.getLayout = function getLayout(page: ReactElement) {
    return (
        <SetupLayout
            title="Install JS snippet"
            subtitle="Add this code snippet on the page(s) where you want Squeak! to appear. Squeak! only looks at path
    named - query parameters are ignored."
        >
            {page}
        </SetupLayout>
    )
}

export const getServerSideProps = withPreflightCheck({
    redirectTo: '/',
    authCheck: true,
    authRedirectTo: '/setup/administration',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        const supabaseClient = supabaseServerClient(context)

        const { user } = await getUser(context)

        const { data: userProfileReadonly } = await supabaseClient
            .from<UserProfileReadonly>('squeak_profiles_readonly')
            .select('organisation_id')
            .eq('user_id', user?.id)
            .single()

        await supabaseClient
            .from<Config>('squeak_config')
            .update({ preflight_complete: true })
            .match({ organisation_id: userProfileReadonly?.organisation_id })

        return {
            props: {},
        }
    },
})

export default Snippet
