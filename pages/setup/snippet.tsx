import { supabaseServerClient, withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs'
import type { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import { ReactElement, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { definitions } from '../../@types/supabase'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'

type Config = definitions['squeak_config']

interface Props {}

const Snippet: NextPageWithLayout<Props> = () => {
    const [snippetCopied, setSnippetCopied] = useState(false)
    const snippet = `<div id="squeak-root" style="max-width: 450px"></div>
<script>
(function() {
    window.squeak = {
        suapabase: {
            apiKey: "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}",
            url: "${process.env.NEXT_PUBLIC_SUPABASE_URL}",
        },
    };
    var d = document,
        s = d.createElement("script");
    s.src = "//${typeof window !== 'undefined' && window.location.host}/snippet/squeak.js";
    (d.head || d.body).appendChild(s);
})();
</script>`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(snippet)
        setSnippetCopied(true)
        setTimeout(() => {
            setSnippetCopied(false)
        }, 2000)
    }
    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <SyntaxHighlighter language="htmlbars">{snippet}</SyntaxHighlighter>
                <button onClick={copyToClipboard} className="mt-2 mb-12 text-orange-600 font-semibold flex space-x-2">
                    <span>Copy to clipboard</span>
                    {snippetCopied && <span className="text-green-600 font-normal">Copied</span>}
                </button>
                <hr className="mb-12" />

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
