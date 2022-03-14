import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Auth, useUser } from '@supabase/supabase-auth-helpers/react'
import { GetStaticPropsResult } from 'next'
import Router from 'next/router'
import { ReactElement, useEffect } from 'react'
import { NextPageWithLayout } from '../../@types/types'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'

interface Props {}

const Administration: NextPageWithLayout<Props> = () => {
    const { user } = useUser()

    useEffect(() => {
        if (user) {
            Router.push('/setup/notifications')
        }
    }, [user])

    return (
        <div>{!user && <Auth view="sign_up" supabaseClient={supabaseClient} redirectTo="/setup/administration" />}</div>
    )
}

Administration.getLayout = function getLayout(page: ReactElement) {
    return (
        <SetupLayout
            title="Administration"
            subtitle="Squeak! uses GitHub authentication for access to the admin portal."
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
