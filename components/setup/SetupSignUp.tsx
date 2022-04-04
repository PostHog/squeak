import SignupForm from '../SignupForm'
import { Dispatch, SetStateAction, useState } from 'react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'

interface Props {
    setView: Dispatch<SetStateAction<'signup' | 'profile'>>
}

const SetupSignUp: React.VoidFunctionComponent<Props> = ({ setView }) => {
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const { error } = await supabaseClient.auth.signUp({ email, password })

        if (error) {
            setError(error.message)
            return
        }

        setView('profile')
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-primary-light">Create an account</h2>

            <SignupForm
                handleSignup={handleSignup}
                error={error}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                className="mt-6"
                ctaText="Create an account"
            />
        </>
    )
}

export default SetupSignUp
