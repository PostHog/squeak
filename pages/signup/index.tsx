import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import Router from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import LoginLayout from '../../layout/LoginLayout'
import type { NextPageWithLayout } from '../../@types/types'
import Link from 'next/link'
import { GetStaticPropsResult } from 'next'
import withMultiTenantCheck from '../../util/withMultiTenantCheck'
import SignupForm from '../../components/SignupForm'

interface Props {}

const Signup: NextPageWithLayout<Props> = () => {
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        const { data: subscription } = supabaseClient.auth.onAuthStateChange((event: string) => {
            if (event === 'SIGNED_IN') {
                Router.push('/signup/profile')
            }
        })

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const { error } = await supabaseClient.auth.signUp({ email, password })

        if (error) {
            setError(error.message)
            return
        }
    }

    return (
        <>
            <SignupForm
                handleSignup={handleSignup}
                error={error}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
            />

            <div className="text-center text-sm">
                <Link href="/login" passHref>
                    <a className="font-medium text-orange-600 hover:text-orange-500">
                        Already got an account? Sign in instead
                    </a>
                </Link>
            </div>
        </>
    )
}

Signup.getLayout = function getLayout(page: ReactElement) {
    return <LoginLayout title="Sign up for an account">{page}</LoginLayout>
}

export const getServerSideProps = withMultiTenantCheck({
    async getServerSideProps(): Promise<GetStaticPropsResult<Props>> {
        return {
            props: {},
        }
    },
})

export default Signup
