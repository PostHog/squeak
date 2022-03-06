import Head from 'next/head'
import Link from 'next/link'

import type { GetServerSideProps, NextPage } from 'next'
import { GetStaticPropsResult } from 'next'

import styles from '../../styles/Home.module.css'
import { createClient } from '@supabase/supabase-js'
import { definitions } from '../../@types/supabase'
import { useState } from 'react'
import Router from 'next/router'

type Config = definitions['config']

interface Props {
    supabaseUrl: string
    supabaseAnonKey: string
    mailgunApiKey: string | undefined
    mailgunDomain: string | undefined
}

const PreflightWelcome: NextPage<Props> = ({
    supabaseUrl,
    supabaseAnonKey,
    mailgunApiKey: serverMailgunApiKey,
    mailgunDomain: serverMailgunDomain,
}) => {
    const [mailgunApiKey, setMailgunApiKey] = useState(serverMailgunApiKey)
    const [mailgunDomain, setMailgunDomain] = useState(serverMailgunDomain)

    const handleSave = async () => {
        // TODO(JS): This needs to be refactored to an API route so we can use the PG service_role on the server
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

        await supabaseClient.from<Config>('config').update({ mailgunApiKey, mailgunDomain }).match({ id: 1 })

        // TODO(JS): Trigger toast?
        // TODO(JS): Handle errors here?

        Router.push('/preflight/user')
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Preflight</h1>

                <p>Step 3. Let's setup Mailgun (optional)</p>

                <p>Some spill about what we need to do here...</p>

                {/* TODO(JS): Do we need a toggle here? Let's wait until the designs */}
                <p>
                    Toggle here that enables the credential section, and makes the fields required (if it's toggled to
                    on?)
                </p>

                <p>Enter your Mailgun credentials</p>

                <input
                    type="text"
                    placeholder="Mailgun API Key"
                    value={mailgunApiKey}
                    onChange={(event) => setMailgunApiKey(event.target.value)}
                />

                <input
                    type="text"
                    placeholder="Mailgun Domain"
                    value={mailgunDomain}
                    onChange={(event) => setMailgunDomain(event.target.value)}
                />

                <button onClick={handleSave}>Save and next</button>

                <Link href="/preflight/user" passHref>
                    <button>Skip this step</button>
                </Link>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (): Promise<GetStaticPropsResult<Props>> => {
    const supabaseUrl = process.env.SUPABASE_URL as string
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data: config } = await supabaseClient
        .from<Config>('squeak_config')
        .select(`mailgunApiKey, mailgunDomain`)
        .eq('id', 1)
        .single()

    // TODO(JS): Handle errors here? I.e if config doesn't exist at all

    return {
        props: {
            supabaseUrl,
            supabaseAnonKey,
            mailgunApiKey: config?.mailgunApiKey,
            mailgunDomain: config?.mailgunDomain,
        },
    }
}

export default PreflightWelcome
