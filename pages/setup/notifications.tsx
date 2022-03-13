import { supabaseClient, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import type { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import Router from 'next/router'
import { ReactElement } from 'react'
import { definitions } from '../../@types/supabase'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    companyName: string
    companyDomain: string
}

const Notifications: NextPageWithLayout<Props> = ({ mailgunApiKey, mailgunDomain, companyName, companyDomain }) => {
    const handleSave = async (values: Props) => {
        const { error } = await supabaseClient
            .from<Config>('squeak_config')
            .update({
                mailgun_api_key: values.mailgunApiKey,
                mailgun_domain: values.mailgunDomain,
                company_name: values.companyName,
                company_domain: values.companyDomain,
            })
            .match({ id: 1 })

        if (!error) Router.push('/setup/alerts')

        // TODO(JS): Trigger toast?
        // TODO(JS): Handle errors here?
    }

    const handleSkip = () => {
        Router.push('/setup/alerts')
    }

    return (
        <div>
            <Head>
                <title>Squeak</title>
                <meta name="description" content="Something about Squeak here..." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <p>
                    Find the following information at{' '}
                    <a target="_blank" rel="noreferrer" href="https://app.mailgun.com/app/account/security/api_keys">
                        https://app.mailgun.com/app/account/security/api_keys
                    </a>
                </p>

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
                    onSubmit={handleSave}
                >
                    {({ isValid }) => {
                        return (
                            <Form className="mt-6">
                                <label htmlFor="mailgunApiKey">Mailgun API key</label>
                                <Field id="mailgunApiKey" name="mailgunApiKey" placeholder="Mailgun API key" />

                                <label htmlFor="mailgunDomain">Mailgun domain</label>
                                <Field id="mailgunDomain" name="mailgunDomain" placeholder="Mailgun domain" />

                                <hr className="my-6" />

                                <p className="mb-6">The following information is used in email notifications</p>

                                <label htmlFor="companyName">Company name</label>
                                <Field id="companyName" name="companyName" placeholder="Squeak" />

                                <label htmlFor="companyDomain">Site URL (without protocol)</label>
                                <Field id="companyDomain" name="companyDomain" placeholder="squeak.posthog.com" />

                                <div className="flex space-x-6 items-center mt-4">
                                    <Button disabled={!isValid} type="submit">
                                        Continue
                                    </Button>
                                    <button onClick={handleSkip} className="text-orange-600 font-semibold">
                                        Skip
                                    </button>
                                </div>
                            </Form>
                        )
                    }}
                </Formik>
            </main>
        </div>
    )
}

Notifications.getLayout = function getLayout(page: ReactElement) {
    return (
        <SetupLayout
            title="Thread notifications"
            subtitle="Send email notifications to users when a reply is posted to the question. This requires a
    transactional email service, and we use Mailgun."
        >
            {page}
        </SetupLayout>
    )
}

export const getServerSideProps = withPreflightCheck({
    redirectTo: '/',
    authCheck: true,
    authRedirectTo: '/setup/administration',
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

export default Notifications
