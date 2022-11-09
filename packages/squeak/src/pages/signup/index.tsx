import { GetServerSideProps, GetStaticPropsResult } from 'next'
import Link from 'next/link'
import Router from 'next/router'
import { ReactElement, useState } from 'react'
import type { NextPageWithLayout } from '../../@types/types'
import SignupForm from '../../components/SignupForm'
import LoginLayout from '../../layout/LoginLayout'
import { createUser } from '../../lib/api/'

interface Props {
    message?: string
    isMultiTenancy: boolean
}

const Signup: NextPageWithLayout<Props> = ({ message }) => {
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        try {
            await createUser(email, password)
            Router.push('/signup/profile')
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
                return
            }
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

            <div className="my-6 text-sm text-center">
                <Link href="/login" passHref>
                    <a className="font-medium text-accent-light hover:text-accent-light">
                        Already got an account? Sign in instead
                    </a>
                </Link>
            </div>

            <div className="flex flex-col items-center space-y-2 pt-6 border-t border-gray-400 border-dashed">
                <span className="text-gray-600">Or signup with</span>

                <Link href="/api/auth/github?action=signup&redirect=/signup/profile">
                    <a className="inline-flex items-center space-x-1 px-2 py-1 rounded hover:bg-orange-100">
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="github"
                            className="w-4 h-4"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path>
                        </svg>
                        <span>GitHub</span>
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
                    <p className="mx-auto mt-4 text-lg text-center text-gray-600 max-w-prose">
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

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    return {
        props: {
            message: ctx.query.message as string | undefined,
            isMultiTenancy: process.env.MULTI_TENANCY ?? false,
        },
    }
}

export default Signup
