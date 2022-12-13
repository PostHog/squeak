import { or } from 'ajv/dist/compile/codegen'
import { GetStaticPropsResult } from 'next'
import Link from 'next/link'
import React, { ReactElement, useState } from 'react'
import CustomerIOSettings from 'src/components/CustomerIOSettings'
import ImageSettings from 'src/components/ImageSettings'
import { NextPageWithLayout } from '../@types/types'

import Button from '../components/Button'
import CodeSnippet from '../components/CodeSnippet'
import CompanyDetails from '../components/CompanyDetails'
import NotificationForm from '../components/NotificationForm'
import PermalinkSettings from '../components/PermalinkSettings'
import ResetPassword from '../components/ResetPassword'
import AllowedOriginTable from '../components/settings/AllowedOriginTable'
import SlackForm from '../components/SlackForm'
import SlackManifestSnippet from '../components/SlackManifestSnippet'
import Surface from '../components/Surface'
import Toggle from '../components/Toggle'
import WebhookTable from '../components/WebhookTable'
import AdminLayout from '../layout/AdminLayout'
import { updateSqueakConfig } from '../lib/api'
import prisma from '../lib/db'
import { withAdminGetStaticProps } from '../util/withAdminAccess'

interface Props {
    organizationId: string
    mailgunApiKey: string
    mailgunDomain: string
    mailgunName: string
    mailgunEmail: string
    companyName: string
    companyDomain: string
    slackApiKey: string
    slackQuestionChannel: string
    questionAutoPublish: boolean
    replyAutoPublish: boolean
    initialShowSlackUserInfo: boolean
    permalinkBase: string
    permalinksEnabled: boolean
    cloudinary_cloud_name: string
    cloudinary_api_key: string
    cloudinary_api_secret: string
    customer_io_app_api_key: string
    customer_io_tracking_api_key: string
    customer_io_broadcast_id?: number | null | undefined
    customer_io_site_id: string
    customer_io_segment_id: string
}

const Settings: NextPageWithLayout<Props> = ({
    organizationId,
    mailgunApiKey,
    mailgunDomain,
    mailgunName,
    mailgunEmail,
    companyName,
    companyDomain,
    slackApiKey,
    slackQuestionChannel,
    questionAutoPublish: initialQuestionAutoPublish,
    replyAutoPublish: initialReplyAutoPublish,
    initialShowSlackUserInfo,
    permalinkBase,
    permalinksEnabled,
    cloudinary_cloud_name,
    cloudinary_api_key,
    cloudinary_api_secret,
    customer_io_app_api_key,
    customer_io_tracking_api_key,
    customer_io_broadcast_id,
    customer_io_site_id,
    customer_io_segment_id,
}) => {
    const [questionAutoPublish, setQuestionAutoPublish] = useState(initialQuestionAutoPublish)
    const [replyAutoPublish, setReplyAutoPublish] = useState(initialReplyAutoPublish)
    const [allQuestions, setAllQuestions] = useState(false)
    const [showSlackUserInfo, setShowSlackUserInfo] = useState(initialShowSlackUserInfo)

    const handleQuestionAutoPublish = async () => {
        await updateSqueakConfig({ question_auto_publish: !questionAutoPublish })
        setQuestionAutoPublish(!questionAutoPublish)
    }

    const handleReplyAutoPublish = async () => {
        await updateSqueakConfig({ reply_auto_publish: !replyAutoPublish })
        setReplyAutoPublish(!replyAutoPublish)
    }

    const handleShowSlackUserInfo = async () => {
        await updateSqueakConfig({ show_slack_user_profiles: !showSlackUserInfo })
        setShowSlackUserInfo(!showSlackUserInfo)
    }

    return (
        <div>
            <Surface className="mb-4">
                <h3 className="font-bold">Snippet</h3>
                <p>Embed this JavaScript snippet on any page where you want Squeak! to appear.</p>
                <p>
                    <strong>Using React?</strong> Use <a href="https://github.com/posthog/squeak-react">squeak-react</a>{' '}
                    and copy in the variables from below.
                </p>
                <div className="overflow-x-auto max-w-6xl -ml-7 -mr-7 my-6 w-[calc(100%_+_3.5rem)]">
                    <CodeSnippet
                        allQuestions={allQuestions}
                        organizationId={organizationId}
                        className="text-sm !px-8"
                    />
                </div>
                <h3 className="font-bold">Snippet settings</h3>
                <Toggle
                    className="pt-1"
                    checked={allQuestions}
                    setChecked={() => setAllQuestions(!allQuestions)}
                    label="Display all questions"
                    helper="Turn this on to display all questions regardless of the pathname"
                />
                <Toggle
                    className="pt-1"
                    checked={showSlackUserInfo}
                    setChecked={handleShowSlackUserInfo}
                    label="Display Slack user info"
                    helper="Turn this on to display first name and avatar on Slack messages"
                />
                <h3 className="mt-6 font-bold">Moderation settings</h3>
                <Toggle
                    className="pt-1"
                    checked={questionAutoPublish}
                    setChecked={handleQuestionAutoPublish}
                    label="Publish new questions automatically"
                    helper="Turn this off if you'd like to moderate questions before they appear on your site"
                />
                <Toggle
                    className="pt-1"
                    checked={replyAutoPublish}
                    setChecked={handleReplyAutoPublish}
                    label="Publish new replies automatically"
                    helper="Disable to moderate replies before they appear on your site"
                />
            </Surface>
            <Surface className="mb-4">
                <h3 className="font-bold">Permalinks</h3>
                <PermalinkSettings
                    companyDomain={companyDomain}
                    permalinkBase={permalinkBase}
                    permalinksEnabled={permalinksEnabled}
                    actionButtons={(isValid, loading) => (
                        <Button loading={loading} disabled={!isValid} type="submit">
                            Save
                        </Button>
                    )}
                />
            </Surface>
            <Surface className="mb-4">
                <h3 className="font-bold">Company details</h3>
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
                <h3 className="font-bold">Alerts</h3>
                <p className="mb-6">
                    Setup outgoing webhooks to alert other services (like Slack) about new questions added to Squeak!
                </p>
                <WebhookTable />
            </Surface>
            <Surface className="mb-4">
                <h3 className="font-bold">Allowed domain(s)</h3>
                <p className="mb-6">Restrict the origins where Squeak! can be embedded.</p>
                <AllowedOriginTable organizationId={organizationId} />
            </Surface>
            <Surface className="mb-4">
                <h3 className="font-bold">Email notifications</h3>
                <p>Configure emails for users when someone answers their question.</p>
                <NotificationForm
                    mailgunName={mailgunName}
                    mailgunEmail={mailgunEmail}
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
                <h3 className="font-bold">Images</h3>
                <p>Connect to Cloudinary to add image support to certain fields</p>
                <ImageSettings
                    cloudinary_cloud_name={cloudinary_cloud_name}
                    cloudinary_api_key={cloudinary_api_key}
                    cloudinary_api_secret={cloudinary_api_secret}
                    actionButtons={(isValid, loading) => (
                        <Button loading={loading} disabled={!isValid} type="submit">
                            Save
                        </Button>
                    )}
                />
            </Surface>
            <Surface className="mb-4">
                <h3 className="font-bold">Customer.io</h3>
                <p>Connect to Customer.io to enable email notifications on roadmap items</p>
                <CustomerIOSettings
                    customer_io_segment_id={customer_io_segment_id}
                    customer_io_site_id={customer_io_site_id}
                    customer_io_broadcast_id={customer_io_broadcast_id}
                    customer_io_app_api_key={customer_io_app_api_key}
                    customer_io_tracking_api_key={customer_io_tracking_api_key}
                    actionButtons={(isValid, loading) => (
                        <Button loading={loading} disabled={!isValid} type="submit">
                            Save
                        </Button>
                    )}
                />
            </Surface>
            <Surface className="mb-4">
                <h3 className="font-bold">Import threads from Slack</h3>
                <p className="mb-6">
                    Manage configuration for importing threads via Slack. (Imported posts appear on the{' '}
                    <Link href="/slack" passHref>
                        <a>Import Slack threads</a>
                    </Link>{' '}
                    page.)
                </p>

                <p>
                    Note: This is specifically for importing threads from Slack. To receive notifications when a user
                    posts a question on your site, visit the Alerts section above.
                </p>
                <hr className="my-8" />
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
                <h3 className="font-bold">Change password</h3>
                <p>Careful, we only ask for it once (because your time is valuable).</p>
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

Settings.getLayout = function getLayout(page: any) {
    return (
        <AdminLayout contentStyle={{ maxWidth: 800, margin: '0 auto' }} title="Settings">
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminGetStaticProps({
    redirectTo: () => '/login',
    async getServerSideProps(context, user): Promise<GetStaticPropsResult<Props>> {
        const config = await prisma.squeakConfig.findFirst({
            select: {
                mailgun_api_key: true,
                mailgun_domain: true,
                mailgun_from_name: true,
                mailgun_from_email: true,
                company_name: true,
                company_domain: true,
                slack_api_key: true,
                slack_question_channel: true,
                question_auto_publish: true,
                reply_auto_publish: true,
                show_slack_user_profiles: true,
                permalink_base: true,
                permalinks_enabled: true,
                cloudinary_cloud_name: true,
                cloudinary_api_key: true,
                cloudinary_api_secret: true,
                customer_io_app_api_key: true,
                customer_io_tracking_api_key: true,
                customer_io_broadcast_id: true,
                customer_io_site_id: true,
                customer_io_segment_id: true,
            },
            where: { organization_id: user.organizationId },
        })

        // TODO(JS): Handle errors here? I.e if config doesn't exist at all

        return {
            props: {
                organizationId: user.organizationId,
                mailgunApiKey: config?.mailgun_api_key || '',
                mailgunDomain: config?.mailgun_domain || '',
                mailgunName: config?.mailgun_from_name || '',
                mailgunEmail: config?.mailgun_from_email || '',
                companyName: config?.company_name || '',
                companyDomain: config?.company_domain || '',
                slackApiKey: config?.slack_api_key || '',
                slackQuestionChannel: config?.slack_question_channel || '',
                questionAutoPublish: config?.question_auto_publish || false,
                replyAutoPublish: config?.reply_auto_publish || false,
                initialShowSlackUserInfo: config?.show_slack_user_profiles || false,
                permalinkBase: config?.permalink_base || '',
                permalinksEnabled: config?.permalinks_enabled || false,
                cloudinary_cloud_name: config?.cloudinary_cloud_name || '',
                cloudinary_api_key: config?.cloudinary_api_key || '',
                cloudinary_api_secret: config?.cloudinary_api_secret || '',
                customer_io_app_api_key: config?.customer_io_app_api_key || '',
                customer_io_tracking_api_key: config?.customer_io_tracking_api_key || '',
                customer_io_broadcast_id: config?.customer_io_broadcast_id,
                customer_io_site_id: config?.customer_io_site_id || '',
                customer_io_segment_id: config?.customer_io_segment_id || '',
            },
        }
    },
})

export default Settings
