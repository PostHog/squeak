import Head from 'next/head'
import Link from 'next/link'

import Router from 'next/router'

import type { GetServerSideProps, GetStaticPropsResult, NextPage } from 'next'

import styles from '../../styles/Home.module.css'
import { createClient } from '@supabase/supabase-js'
import { definitions } from '../../@types/supabase'
import { useState } from 'react'

type Config = definitions['config']

interface Props {
    supabaseUrl: string
    supabaseAnonKey: string
    slackApiKey: string | undefined
    slackQuestionChannel: string | undefined
    slackSigningSecret: string | undefined
}

const PreflightWelcome: NextPage<Props> = ({
    supabaseUrl,
    supabaseAnonKey,
    slackApiKey: serverApiKey,
    slackQuestionChannel: serverSlackQuestionChannel,
    slackSigningSecret: serverSlackSigningSecret,
}) => {
    const [slackApiKey, setSlackApiKey] = useState(serverApiKey)
    const [slackQuestionChannel, setSlackQuestionChannel] = useState(serverSlackQuestionChannel)
    const [slackSigningSecret, setSlackSigningSecret] = useState(serverSlackSigningSecret)

    const handleSave = async () => {
        // TODO(JS): This needs to be refactored to an API route so we can use the PG service_role on the server
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

        await supabaseClient
            .from<Config>('sqeak_config')
            .update({ slackApiKey, slackQuestionChannel, slackSigningSecret })
            .match({ id: 1 })

        // TODO(JS): Trigger toast?
        // TODO(JS): Handle errors here?

        Router.push('/preflight/mailgun')
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

                <p>Step 2. Let's setup Slack (optional)</p>

                <p>Some spill about what we need to do here...</p>

                {/* TODO(JS): Do we need a toggle here? Let's wait until the designs */}
                <p>
                    Toggle here that enables the credential section, and makes the fields required (if it's toggled to
                    on?)
                </p>

                <p>Enter your Slack credentials</p>
                <input
                    type="text"
                    placeholder="Slack API Key"
                    value={slackApiKey}
                    onChange={(event) => setSlackApiKey(event.target.value)}
                />

                <input
                    type="password"
                    placeholder="Slack Signing Secret"
                    value={slackSigningSecret}
                    onChange={(event) => setSlackSigningSecret(event.target.value)}
                />

                {/* TODO(JS): Could we pull this from the Slack API and make it a dropdown? */}
                <input
                    type="text"
                    placeholder="Slack Question Channel"
                    value={slackQuestionChannel}
                    onChange={(event) => setSlackQuestionChannel(event.target.value)}
                />

                <button onClick={handleSave}>Save and next</button>

                <Link href="/preflight/mailgun" passHref>
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
        .select(`slackApiKey, slackQuestionChannel, slackSigningSecret`)
        .eq('id', 1)
        .single()

    // TODO(JS): Handle errors here? I.e if config doesn't exist at all

    return {
        props: {
            supabaseUrl,
            supabaseAnonKey,
            slackApiKey: config?.slackApiKey,
            slackQuestionChannel: config?.slackQuestionChannel,
            slackSigningSecret: config?.slackSigningSecret,
        },
    }
}

export default PreflightWelcome
