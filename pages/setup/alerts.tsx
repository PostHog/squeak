import Head from 'next/head'
import Link from 'next/link'

import Router from 'next/router'

import type { GetStaticPropsResult, NextPage } from 'next'

import styles from '../../styles/Home.module.css'
import { definitions } from '../../@types/supabase'
import { useState } from 'react'
import { supabaseClient, supabaseServerClient, withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs'

type Config = definitions['squeak_config']

interface Props {
    slackApiKey: string | undefined
    slackQuestionChannel: string | undefined
    slackSigningSecret: string | undefined
}

const PreflightWelcome: NextPage<Props> = ({
    slackApiKey: serverApiKey,
    slackQuestionChannel: serverSlackQuestionChannel,
    slackSigningSecret: serverSlackSigningSecret,
}) => {
    const [slackApiKey, setSlackApiKey] = useState(serverApiKey)
    const [slackQuestionChannel, setSlackQuestionChannel] = useState(serverSlackQuestionChannel)
    const [slackSigningSecret, setSlackSigningSecret] = useState(serverSlackSigningSecret)

    const handleSave = async () => {
        await supabaseClient
            .from<Config>('squeak_config')
            .update({
                slack_api_key: slackApiKey,
                slack_question_channel: slackQuestionChannel,
                slack_signing_secret: slackSigningSecret,
            })
            .match({ id: 1 })

        // TODO(JS): Trigger toast?
        // TODO(JS): Handle errors here?

        Router.push('/setup/snippet')
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Moderator alerts</h1>

                <p>Let moderators receive alerts in Slack when new questions or replies are posted.</p>

                <p>
                    Find the following information at{' '}
                    <a href="#">&#123;yourslack&#125;.slack.com/admin/not/sure/full/path</a>
                </p>

                <label htmlFor="slackApiKey">Slack API Key</label>
                <input
                    name="slackApiKey"
                    type="text"
                    placeholder="Slack API Key"
                    value={slackApiKey}
                    onChange={(event) => setSlackApiKey(event.target.value)}
                />

                <label htmlFor="slackApiSecret">Slack API Secret</label>
                <input
                    name="slackApiSecret"
                    type="password"
                    placeholder="Slack API Secret"
                    value={slackSigningSecret}
                    onChange={(event) => setSlackSigningSecret(event.target.value)}
                />

                <button>Authenticate with Slack</button>

                <label htmlFor="slackQuestionChannel">Channel name (for alerts)</label>
                <select
                    name="slackQuestionChannel"
                    value={slackQuestionChannel}
                    onChange={(event) => setSlackQuestionChannel(event.target.value)}
                    placeholder="Ex #questions"
                >
                    <option value="foo">#foo</option>
                </select>

                <button onClick={handleSave}>Continue</button>
            </main>
        </div>
    )
}

export const getServerSideProps = withAuthRequired({
    redirectTo: '/setup/administration',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        // TODO(JS) Check the user is an admin

        const { data: config } = await supabaseServerClient(context)
            .from<Config>('squeak_config')
            .select(`slack_api_key, slack_question_channel, slack_signing_secret`)
            .eq('id', 1)
            .single()

        // TODO(JS): Handle errors here? I.e if config doesn't exist at all

        return {
            props: {
                slackApiKey: config?.slack_api_key,
                slackQuestionChannel: config?.slack_question_channel,
                slackSigningSecret: config?.slack_signing_secret,
            },
        }
    },
})

export default PreflightWelcome
