import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { GetStaticPropsResult } from 'next'
import Link from 'next/link'
import Router from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import type { NextPageWithLayout } from '../../@types/types'
import SignupForm from '../../components/SignupForm'
import LoginLayout from '../../layout/LoginLayout'

interface Props {
    isMultiTenancy: boolean
}

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

            <div className="mt-6 text-center text-sm">
                <Link href="/login" passHref>
                    <a className="font-medium text-accent-light hover:text-accent-light">
                        Already got an account? Sign in instead
                    </a>
                </Link>
            </div>
        </>
    )
}

Signup.getLayout = function getLayout(page: ReactElement<Props>) {
    return (
        <LoginLayout
            title="Sign up for an account"
            subtitle={
                page.props.isMultiTenancy && (
                    <p className="mt-4 text-center text-lg text-gray-600 max-w-prose mx-auto">
                        Squeak! is a Q&A widget that lets your users ask questions on any page of your website or docs.
                        Learn more at <a href="https://squeak.posthog.com">squeak.posthog.com</a>.
                    </p>
                )
            }
        >
            {page}
        </LoginLayout>
    )
}

export const getServerSideProps = (): GetStaticPropsResult<Props> => {
    return {
        props: {
            isMultiTenancy: (process.env.MULTI_TENANCY as unknown as boolean) ?? false,
        },
    }
}

export default Signup
