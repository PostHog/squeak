import { GetStaticPropsResult } from 'next'
import withAdminAccess from '../util/withAdminAccess'
import { NextPageWithLayout } from '../@types/types'
import { ReactElement } from 'react'
import AdminLayout from '../layout/AdminLayout'
import Button from '../components/Button'
import { supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { definitions } from '../@types/supabase'
import { Field, Form, Formik } from 'formik'
import CodeSnippet from '../components/CodeSnippet'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    companyName: string
    companyDomain: string
}

const Settings: NextPageWithLayout<Props> = ({ mailgunApiKey, mailgunDomain, companyName, companyDomain }) => {
    const handleSaveNotifications = async (values: Props) => {
        await supabaseClient
            .from<Config>('squeak_config')
            .update({
                mailgun_api_key: values.mailgunApiKey,
                mailgun_domain: values.mailgunDomain,
                company_name: values.companyName,
                company_domain: values.companyDomain,
            })
            .match({ id: 1 })

        // TODO(JS): Trigger toast?
        // TODO(JS): Handle errors here?
    }

    return (
        <div>
            <h3>Snippet</h3>
            <p>
                Great news! You're all setup to receive questions on your site. Here's the snippet if you need to put it
                on other pages.
            </p>
            <hr />
            <CodeSnippet className="max-w-6xl" />
            <h3>Notifications</h3>
            <p>Manage configuration for reply notifications via Mailgun</p>
            <hr />
            <Formik
                validateOnMount
                validate={(values) => {
                    const errors: {
                        mailgunApiKey?: string
                        mailgunDomain?: string
                        companyName?: string
                        companyDomain?: string
                    } = {}
                    if (!values.mailgunApiKey) {
                        errors.mailgunApiKey = 'Required'
                    }
                    if (!values.mailgunDomain) {
                        errors.mailgunDomain = 'Required'
                    }
                    if (!values.companyName) {
                        errors.companyName = 'Required'
                    }
                    if (!values.companyDomain) {
                        errors.companyDomain = 'Required'
                    }
                    return errors
                }}
                initialValues={{
                    mailgunApiKey,
                    mailgunDomain,
                    companyName,
                    companyDomain,
                }}
                onSubmit={handleSaveNotifications}
            >
                {({ isValid }) => {
                    return (
                        <Form className="mt-6">
                            <label htmlFor="mailgunApiKey">Mailgun API key</label>
                            <Field id="mailgunApiKey" name="mailgunApiKey" placeholder="Mailgun API key" />

                            <label htmlFor="mailgunDomain">Mailgun domain</label>
                            <Field id="mailgunDomain" name="mailgunDomain" placeholder="Mailgun domain" />

                            <label htmlFor="companyName">Company name</label>
                            <Field id="companyName" name="companyName" placeholder="Squeak" />

                            <label htmlFor="companyDomain">Site URL (without protocol)</label>
                            <Field id="companyDomain" name="companyDomain" placeholder="squeak.posthog.com" />

                            <div className="flex space-x-6 items-center mt-4">
                                <Button disabled={!isValid} type="submit">
                                    Save
                                </Button>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
            <h3>Alerts</h3>
            <p>Manage configuration for admin alerts via Slack</p>
            <hr />
            UPDATED SLACK FORM HERE
        </div>
    )
}

Settings.getLayout = function getLayout(page: ReactElement) {
    return <AdminLayout title="Settings">{page}</AdminLayout>
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        const { data: config } = await supabaseServerClient(context)
            .from<Config>('squeak_config')
            .select(`mailgun_api_key, mailgun_domain, company_name, company_domain`)
            .eq('id', 1)
            .single()

        // TODO(JS): Handle errors here? I.e if config doesn't exist at all

        return {
            props: {
                mailgunApiKey: config?.mailgun_api_key || '',
                mailgunDomain: config?.mailgun_domain || '',
                companyName: config?.company_name || '',
                companyDomain: config?.company_domain || '',
            },
        }
    },
})

export default Settings
