import Router from 'next/router'
import { logout } from '../lib/api/auth'

const LogoutButton = () => {
    const handleLogout = async () => {
        await logout()
        Router.push('/login')
    }

    return <button onClick={handleLogout}>Logout</button>
}

export default LogoutButton
