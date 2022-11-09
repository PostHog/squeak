import type { GetStaticPropsResult } from 'next'
import Router from 'next/router'
import { ReactElement } from 'react'

import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import NotificationForm from '../../components/NotificationForm'
import SetupLayout from '../../layout/SetupLayout'
import prisma from '../../lib/db'
import withPreflightCheck from '../../util/withPreflightCheck'

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    mailgunName: string
    mailgunEmail: string
}

const Notifications: NextPageWithLayout<Props> = ({ mailgunApiKey, mailgunDomain, mailgunName, mailgunEmail }) => {
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
                    mailgunName={mailgunName}
                    mailgunEmail={mailgunEmail}
                    mailgunApiKey={mailgunApiKey}
                    mailgunDomain={mailgunDomain}
                    redirect="/setup/alerts"
                    actionButtons={(isValid, loading) => (
                        <>
                            <Button loading={loading} disabled={!isValid} type="submit">
                                Continue
                            </Button>
                            <button onClick={handleSkip} className="font-semibold text-accent-light">
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
        const config = await prisma.squeakConfig.findFirst({
            select: {
                mailgun_api_key: true,
                mailgun_domain: true,
                mailgun_from_name: true,
                mailgun_from_email: true,
                company_name: true,
                company_domain: true,
            },
        })

        // TODO(JS): Handle errors here? I.e if config doesn't exist at all

        return {
            props: {
                mailgunApiKey: config?.mailgun_api_key || '',
                mailgunDomain: config?.mailgun_domain || '',
                mailgunName: config?.mailgun_from_name || '',
                mailgunEmail: config?.mailgun_from_email || '',
            },
        }
    },
})

export default Notifications
