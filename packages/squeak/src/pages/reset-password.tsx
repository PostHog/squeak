import { ReactElement } from 'react'
import type { NextPageWithLayout } from '../@types/types'
import Button from '../components/Button'
import ResetPassword from '../components/ResetPassword'
import LoginLayout from '../layout/LoginLayout'

const Reset: NextPageWithLayout = () => {
    return (
        <LoginLayout title="Reset your password">
            <ResetPassword
                actionButtons={(isValid: boolean, loading: boolean) => (
                    <Button loading={loading} disabled={!isValid} type="submit">
                        Update
                    </Button>
                )}
            />
        </LoginLayout>
    )
}

export default Reset
