import { GetStaticPropsResult } from 'next'
import { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'

import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import { sql } from '../../components/SQLSnippet'
import SetupLayout from '../../layout/SetupLayout'
import { doPost } from '../../lib/api'
import prisma from '../../lib/db'
import withPreflightCheck from '../../util/withPreflightCheck'

interface Props {
    initialDatabaseSetup: boolean
    databaseUrlProvided: boolean
}

const Database: NextPageWithLayout<Props> = ({ initialDatabaseSetup, databaseUrlProvided }) => {
    const [databaseSetup, setDatabaseSetup] = useState(initialDatabaseSetup)
    const [sqlCopied, setSqlCopied] = useState(false)

    const validateDatabaseSetup = async () => {
        try {
            await doPost('/api/database/check')
            setDatabaseSetup(true)
        } catch (error) {
            console.error(error)
            setDatabaseSetup(false)
        }
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

                        <SyntaxHighlighter
                            language="sql"
                            className="max-w-2xl shadow !p-4 max-h-96 rounded-md !bg-white text-xs border border-solid border-gray"
                        >
                            {sql}
                        </SyntaxHighlighter>

                        <button
                            onClick={copyToClipboard}
                            className="flex mt-2 mb-12 space-x-2 font-semibold text-accent-light"
                        >
                            <span>Copy to clipboard</span>
                            {sqlCopied && <span className="font-normal text-green-600">Copied</span>}
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
        try {
            await prisma.question.findFirst()
            return {
                props: {
                    initialDatabaseSetup: true,
                    databaseUrlProvided: !!process.env.DATABASE_URL,
                },
            }
        } catch (error) {
            return {
                props: {
                    initialDatabaseSetup: true,
                    databaseUrlProvided: !!process.env.DATABASE_URL,
                },
            }
        }
    },
})

export default Database
