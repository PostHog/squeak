import { supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { GetStaticPropsResult } from 'next'
import React, { ReactElement, useState } from 'react'
import { definitions } from '../@types/supabase'
import { NextPageWithLayout } from '../@types/types'
import Button from '../components/Button'
import CodeSnippet from '../components/CodeSnippet'
import CompanyDetails from '../components/CompanyDetails'
import NotificationForm from '../components/NotificationForm'
import ResetPassword from '../components/ResetPassword'
import SlackForm from '../components/SlackForm'
import SlackManifestSnippet from '../components/SlackManifestSnippet'
import Surface from '../components/Surface'
import Toggle from '../components/Toggle'
import WebhookTable from '../components/WebhookTable'
import AdminLayout from '../layout/AdminLayout'
import getActiveOrganization from '../util/getActiveOrganization'
import useActiveOrganization from '../util/useActiveOrganization'
import withAdminAccess from '../util/withAdminAccess'
import Link from 'next/link'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    companyName: string
    companyDomain: string
    slackApiKey: string
    slackQuestionChannel: string
    publishAutomatically: boolean
}

const Settings: NextPageWithLayout<Props> = ({
    mailgunApiKey,
    mailgunDomain,
    companyName,
    companyDomain,
    slackApiKey,
    slackQuestionChannel,
    publishAutomatically,
}) => {
    const [autoPublish, setAutopublish] = useState(publishAutomatically)
    const { getActiveOrganization } = useActiveOrganization()

    const handleAutoPublish = async () => {
        const organizationId = getActiveOrganization()
        await supabaseClient
            .from('squeak_config')
            .update({
                question_auto_publish: !autoPublish,
            })
            .match({ organization_id: organizationId })
        setAutopublish(!autoPublish)
    }

    return (
        <div>
            <Surface className="mb-4">
                <h3>Snippet</h3>
                <p>
                    Great news! You're all setup to receive questions on your site. Here's the snippet if you need to
                    put it on other pages.
                </p>
                <CodeSnippet className="max-w-6xl -ml-7 -mr-7 my-6 !px-8 text-sm !mb-2" />
                <Toggle
                    className="mt-6"
                    checked={autoPublish}
                    setChecked={handleAutoPublish}
                    label="Publish new questions automatically"
                    helper="Disable to moderate questions before they appear on your site"
                />
            </Surface>
            <Surface className="mb-4">
                <h3>Company details</h3>
                <CompanyDetails
                    companyDomain={companyDomain}
                    companyName={companyName}
                    actionButtons={(isValid, loading) => (
                        <Button loading={loading} disabled={!isValid} type="submit">
                            Save
                        </Button>
                    )}
                />
            </Surface>
            <Surface className="mb-4">
                <h3>Alerts</h3>
                <p className="mb-6">
                    Setup outgoing webhooks to alert other services about new questions added to Squeak!
                </p>
                <WebhookTable />
            </Surface>
            <Surface className="mb-4">
                <h3>Notifications</h3>
                <p>Manage configuration for reply notifications via Mailgun</p>
                <NotificationForm
                    mailgunDomain={mailgunDomain}
                    mailgunApiKey={mailgunApiKey}
                    actionButtons={(isValid, loading) => (
                        <Button loading={loading} disabled={!isValid} type="submit">
                            Save
                        </Button>
                    )}
                />
            </Surface>
            <Surface className="mb-4">
                <h3>Slack</h3>
                <p className="mb-6">
                    Manage configuration for importing threads via Slack. (Imported posts appear on the{' '}
                    <Link href="/slack" passHref>
                        <a>Import Slack threads</a>
                    </Link>{' '}
                    page.)
                </p>
                <SlackManifestSnippet />

                <SlackForm
                    slackApiKey={slackApiKey}
                    slackQuestionChannel={slackQuestionChannel}
                    actionButtons={(isValid: boolean, loading: boolean) => (
                        <Button loading={loading} disabled={!isValid} type="submit">
                            Save
                        </Button>
                    )}
                />
            </Surface>
            <Surface>
                <h3>Change password</h3>
                <ResetPassword
                    actionButtons={(isValid: boolean, loading: boolean) => (
                        <Button loading={loading} disabled={!isValid} type="submit">
                            Update
                        </Button>
                    )}
                />
            </Surface>
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
                `mailgun_api_key, mailgun_domain, company_name, company_domain, slack_api_key, slack_question_channel, question_auto_publish`
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
                publishAutomatically: config?.question_auto_publish || false,
            },
        }
    },
})

export default Settings
