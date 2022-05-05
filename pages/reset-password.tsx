import { ReactElement } from 'react'
import type { NextPageWithLayout } from '../@types/types'
import Button from '../components/Button'
import ResetPassword from '../components/ResetPassword'
import LoginLayout from '../layout/LoginLayout'
import withAdminAccess from '../util/withAdminAccess'

const Reset: NextPageWithLayout = () => {
    return (
        <ResetPassword
            actionButtons={(isValid: boolean, loading: boolean) => (
                <Button loading={loading} disabled={!isValid} type="submit">
                    Update
                </Button>
            )}
        />
    )
}

Reset.getLayout = function getLayout(page: ReactElement) {
    return <LoginLayout title="Reset your password">{page}</LoginLayout>
}

export const getServerSideProps = withAdminAccess({
    redirectTo: () => '/login',
})

export default Reset
