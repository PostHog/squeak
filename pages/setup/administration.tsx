import { GetStaticPropsResult } from 'next'
import { ReactElement, useEffect, useState } from 'react'
import { NextPageWithLayout } from '../../@types/types'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'
import SetupSignUp from '../../components/setup/SetupSignUp'
import SetupProfile from '../../components/setup/SetupProfile'
import { useUser } from '@supabase/supabase-auth-helpers/react'

interface Props {}

const Administration: NextPageWithLayout<Props> = () => {
    const [view, setView] = useState<'signup' | 'profile'>('signup')

    const { user } = useUser()

    useEffect(() => {
        if (user) {
            setView('profile')
        }
    }, [user])

    if (!user || view === 'signup') {
        return <SetupSignUp setView={setView} />
    }

    return <SetupProfile user={user} />
}

Administration.getLayout = function getLayout(page: ReactElement) {
    return (
        <SetupLayout
            title="Administration"
            subtitle="Squeak! uses Supabase authentication for access to the admin portal."
        >
            {page}
        </SetupLayout>
    )
}

export const getServerSideProps = withPreflightCheck({
    redirectTo: '/',
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Administration
