import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { GetStaticPropsResult } from 'next'
import Router from 'next/router'
import { ReactElement } from 'react'
import { definitions } from '../../@types/supabase'
import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'
import NotificationForm from '../../components/NotificationForm'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    companyName: string
    companyDomain: string
}

const Notifications: NextPageWithLayout<Props> = ({ mailgunApiKey, mailgunDomain, companyName, companyDomain }) => {
    const handleSkip = () => {
        Router.push('/setup/alerts')
    }

    return (
        <div>
            <main>
                <p>
                    Find the following information at{' '}
                    <a target="_blank" rel="noreferrer" href="https://app.mailgun.com/app/account/security/api_keys">
                        https://app.mailgun.com/app/account/security/api_keys
                    </a>
                </p>

                <NotificationForm
                    mailgunApiKey={mailgunApiKey}
                    mailgunDomain={mailgunDomain}
                    companyName={companyName}
                    companyDomain={companyDomain}
                    redirect="/setup/alerts"
                    actionButtons={(isValid) => (
                        <>
                            <Button disabled={!isValid} type="submit">
                                Continue
                            </Button>
                            <button onClick={handleSkip} className="text-orange-600 font-semibold">
                                Skip
                            </button>
                        </>
                    )}
                />
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
