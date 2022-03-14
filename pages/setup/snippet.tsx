import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import { ReactElement } from 'react'
import { definitions } from '../../@types/supabase'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import CodeSnippet from '../../components/CodeSnippet'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'

type Config = definitions['squeak_config']

interface Props {}

const Snippet: NextPageWithLayout<Props> = () => {
    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

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

        await supabaseClient.from<Config>('squeak_config').update({ preflight_complete: true }).match({ id: 1 })

        return {
            props: {},
        }
    },
})

export default Snippet
