import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useEffect } from 'react'
import Router from 'next/router'

const LogoutButton = () => {
    useEffect(() => {
        const { data: subscription } = supabaseClient.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                Router.push('/login')
            }
        })

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    const handleLogout = async () => {
        await supabaseClient.auth.signOut()
    }

    return <button onClick={handleLogout}>Logout</button>
}

export default LogoutButton
