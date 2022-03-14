import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { createClient } from '@supabase/supabase-js'
import { GetStaticPropsResult } from 'next'
import { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import { sql } from '../../components/SQLSnippet'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'

interface Props {
    initialDatabaseSetup: boolean
    databaseUrlProvided: boolean
}

const Database: NextPageWithLayout<Props> = ({ initialDatabaseSetup, databaseUrlProvided }) => {
    const [databaseSetup, setDatabaseSetup] = useState(initialDatabaseSetup)
    const [sqlCopied, setSqlCopied] = useState(false)

    const validateDatabaseSetup = async () => {
        const { error } = await supabaseClient.from('squeak_messages').select('*').single()
        setDatabaseSetup(!(error && error.code === '42P01'))
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sql)
        setSqlCopied(true)
        setTimeout(() => {
            setSqlCopied(false)
        }, 2000)
    }

    return (
        <SetupLayout
            title="Database"
            subtitle={
                databaseSetup
                    ? 'Squeak! runs on Postgres. To make things simple, we use Supabase.'
                    : `Since Postgres credentials weren’t passed as environment variables, you’ll need to manually
        run this SQL in your Supabase project.`
            }
        >
            <main>
                {databaseSetup && (
                    <>
                        <div className="p-6 border-green-700 border rounded-lg max-w-[650px]">
                            <h3>Database setup complete</h3>

                            {databaseUrlProvided ? (
                                <p>
                                    Supabase and Postgres credentials were already provided, so your database has been
                                    automatically configured.
                                </p>
                            ) : (
                                <p>We have checked Supabase and validated your database is setup correctly.</p>
                            )}
                        </div>

                        <p className="my-6">You’re ready to continue to the next step.</p>

                        <Button href="/setup/administration">Continue</Button>
                    </>
                )}

                {!databaseSetup && (
                    <>
                        <p className="mb-4">Run the following SQL in your project to create tables and columns</p>

                        <SyntaxHighlighter language="sql" className="max-w-2xl max-h-96 rounded-md">
                            {sql}
                        </SyntaxHighlighter>

                        <button
                            onClick={copyToClipboard}
                            className="mt-2 mb-12 text-orange-600 font-semibold flex space-x-2"
                        >
                            <span>Copy to clipboard</span>
                            {sqlCopied && <span className="text-green-600 font-normal">Copied</span>}
                        </button>

                        <Button onClick={validateDatabaseSetup}>Validate</Button>
                    </>
                )}
            </main>
        </SetupLayout>
    )
}

export const getServerSideProps = withPreflightCheck({
    redirectTo: '/',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

        const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

        const { error } = await supabaseClient.from('squeak_messages').select('*').single()

        return {
            props: {
                initialDatabaseSetup: !(error && error.code === '42P01'),
                databaseUrlProvided: !!process.env.DATABASE_URL,
            },
        }
    },
})

export default Database
