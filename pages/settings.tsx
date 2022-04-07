import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { GetStaticPropsResult } from 'next'
import React, { ReactElement } from 'react'
import { definitions } from '../@types/supabase'
import { NextPageWithLayout } from '../@types/types'
import Button from '../components/Button'
import CodeSnippet from '../components/CodeSnippet'
import NotificationForm from '../components/NotificationForm'
import Surface from '../components/Surface'
import WebhookTable from '../components/WebhookTable'
import AdminLayout from '../layout/AdminLayout'
import getActiveOrganization from '../util/getActiveOrganization'
import withAdminAccess from '../util/withAdminAccess'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    companyName: string
    companyDomain: string
    slackApiKey: string
    slackQuestionChannel: string
}

const Settings: NextPageWithLayout<Props> = ({ mailgunApiKey, mailgunDomain, companyName, companyDomain }) => {
    return (
        <div>
            <Surface className="mb-4">
                <h3>Snippet</h3>
                <p>
                    Great news! You're all setup to receive questions on your site. Here's the snippet if you need to
                    put it on other pages.
                </p>
                <CodeSnippet className="max-w-6xl -ml-7 -mr-7 my-7" />
            </Surface>
            <Surface className="mb-4">
                <h3>Alerts</h3>
                <p>Setup outgoing webhooks to alert other services about new questions added to Squeak!</p>
                <WebhookTable />
            </Surface>
            <Surface className="mb-4">
                <h3>Notifications</h3>
                <p>Manage configuration for reply notifications via Mailgun</p>
                <NotificationForm
                    companyDomain={companyDomain}
                    companyName={companyName}
                    mailgunDomain={mailgunDomain}
                    mailgunApiKey={mailgunApiKey}
                    actionButtons={(isValid) => (
                        <Button disabled={!isValid} type="submit">
                            Save
                        </Button>
                    )}
                />
            </Surface>

            {/* <p>Manage configuration for admin alerts via Slack</p>
            <hr />

            <p className="my-2 block font-semibold">Instructions</p>
            <SlackManifestSnippet />

            <SlackForm
                slackApiKey={slackApiKey}
                slackQuestionChannel={slackQuestionChannel}
                actionButtons={(isValid) => (
                    <Button disabled={!isValid} type="submit">
                        Save
                    </Button>
                )}
            /> */}
        </div>
    )
}

Settings.getLayout = function getLayout(page: ReactElement) {
    return (
        <AdminLayout contentStyle={{ maxWidth: 800, margin: '0 auto' }} title="Settings">
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        const organizationId = getActiveOrganization(context)

        const { data: config } = await supabaseServerClient(context)
            .from<Config>('squeak_config')
            .select(
                `mailgun_api_key, mailgun_domain, company_name, company_domain, slack_api_key, slack_question_channel`
            )
            .eq('organization_id', organizationId)
            .single()

        // TODO(JS): Handle errors here? I.e if config doesn't exist at all

        return {
            props: {
                mailgunApiKey: config?.mailgun_api_key || '',
                mailgunDomain: config?.mailgun_domain || '',
                companyName: config?.company_name || '',
                companyDomain: config?.company_domain || '',
                slackApiKey: config?.slack_api_key || '',
                slackQuestionChannel: config?.slack_question_channel || '',
            },
        }
    },
})

export default Settings
