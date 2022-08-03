import { GetStaticPropsResult } from 'next'
import Router from 'next/router'
import type { ReactElement } from 'react'
import { useState } from 'react'

import type { NextPageWithLayout } from '../../@types/types'
import ProfileForm from '../../components/ProfileForm'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import LoginLayout from '../../layout/LoginLayout'
import withMultiTenantCheck from '../../util/withMultiTenantCheck'
import posthog from 'posthog-js'
import { getSessionUser } from '../../lib/auth'
import { setupUser } from '../../lib/api'

interface Props {}

const Profile: NextPageWithLayout<Props> = () => {
    const { setActiveOrganization } = useActiveOrganization()

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [organizationName, setOrganizationName] = useState('')
    const [url, setUrl] = useState('')

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { body } = await setupUser({
                firstName,
                lastName,
                organizationName,
                url,
                distinctId: posthog?.get_distinct_id(),
            })
            if (!body) return

            const { userId, organizationId } = body

            await setActiveOrganization(userId, organizationId)

            posthog.identify(userId)
            posthog.group('organization', `id:${organizationId}`)

            Router.push('/questions')
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
                return
            }
        }
    }

    return (
        <ProfileForm
            handleSignup={handleSignup}
            error={error}
            loading={loading}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            organizationName={organizationName}
            setOrganizationName={setOrganizationName}
            url={url}
            setUrl={setUrl}
        />
    )
}

Profile.getLayout = function getLayout(page: ReactElement) {
    return <LoginLayout title="Complete your profile">{page}</LoginLayout>
}

export const getServerSideProps = withMultiTenantCheck({
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        const user = await getSessionUser(context.req)

        if (!user) {
            return {
                redirect: {
                    destination: '/signup',
                    permanent: false,
                },
            }
        }

        return {
            props: {},
        }
    },
})

export default Profile
