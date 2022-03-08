import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { createClient } from '@supabase/supabase-js'
import { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { ReactElement, useState } from 'react'
import { NextPageWithLayout } from '../../@types/types'
import SetupLayout from '../../layout/SetupLayout'

interface Props {
    initialDatabaseSetup: boolean
}

const Database: NextPageWithLayout<Props> = ({ initialDatabaseSetup }) => {
    const [databaseSetup, setDatabaseSetup] = useState(initialDatabaseSetup)

    const validateDatabaseSetup = async () => {
        const { error } = await supabaseClient.from('squeak_messages').select('*').single()

        setDatabaseSetup(!(error && error.code === '42P01'))
    }

    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1>Database</h1>

                {databaseSetup && (
                    <>
                        <p>Squeak! runs on Postgres. To make things simple, we use Supabase.</p>

                        <div style={{ border: '1px solid green' }}>
                            <h3>Database setup complete</h3>
                            <p>
                                Supabase and Postgres credentials were already provided, so your database has been
                                automatically configured.
                            </p>
                        </div>

                        <p>You’re ready to continue to the next step.</p>

                        <Link href="/setup/administration" passHref>
                            <button>Continue</button>
                        </Link>
                    </>
                )}

                {!databaseSetup && (
                    <>
                        <p>
                            Since Postgres credentials weren’t passed as environment variables, you’ll need to manually
                            run this SQL in your Supabase project.
                        </p>

                        <p>Run the following SQL in your project to create tables and columns</p>

                        <div>SQL HERE</div>

                        <p>Copy to clipboard</p>

                        <button onClick={validateDatabaseSetup}>Validate</button>
                    </>
                )}
            </main>
        </div>
    )
}

Database.getLayout = function getLayout(page: ReactElement) {
    return <SetupLayout>{page}</SetupLayout>
}

export const getServerSideProps = async (): Promise<GetStaticPropsResult<Props>> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { error } = await supabaseClient.from('squeak_messages').select('*').single()

    return {
        props: {
            initialDatabaseSetup: !(error && error.code === '42P01'),
        },
    }
}

export default Database
