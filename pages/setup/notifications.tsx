import { supabaseClient, supabaseServerClient, withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import type { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import Router from 'next/router'
import { ReactElement } from 'react'
import { definitions } from '../../@types/supabase'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string | undefined
    mailgunDomain: string | undefined
}

const Notifications: NextPageWithLayout<Props> = ({ mailgunApiKey, mailgunDomain }) => {
    const handleSave = async (values: Props) => {
        const { error, data } = await supabaseClient
            .from<Config>('squeak_config')
            .update({ mailgun_api_key: values.mailgunApiKey, mailgun_domain: values.mailgunDomain })
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
                    <a target="_blank" href="https://app.mailgun.com/app/account/security/api_keys">
                        https://app.mailgun.com/app/account/security/api_keys
                    </a>
                </p>

                <Formik
                    validateOnMount
                    validate={(values) => {
                        const errors: any = {}
                        if (!values.mailgunApiKey) {
                            errors.mailgunApiKey = 'Required'
                        }
                        if (!values.mailgunDomain) {
                            errors.mailgunDomain = 'Required'
                        }
                        return errors
                    }}
                    initialValues={{
                        mailgunApiKey,
                        mailgunDomain,
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

export const getServerSideProps = withAuthRequired({
    redirectTo: '/setup/administration',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        // TODO(JS) Check the user is an admin

        const { data: config } = await supabaseServerClient(context)
            .from<Config>('squeak_config')
            .select(`mailgun_api_key, mailgun_domain`)
            .eq('id', 1)
            .single()

        // TODO(JS): Handle errors here? I.e if config doesn't exist at all

        return {
            props: {
                mailgunApiKey: config?.mailgun_api_key || '',
                mailgunDomain: config?.mailgun_domain || '',
            },
        }
    },
})

export default Notifications
