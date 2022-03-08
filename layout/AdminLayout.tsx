import { useUser } from '@supabase/supabase-auth-helpers/react'

const AdminLayout: React.FunctionComponent = ({ children }) => {
    const user = useUser()

    if (!user) {
        return (
            <div>
                <h1>You must be logged in to view this page</h1>
            </div>
        )
    }

    return <>{children}</>
}

export default AdminLayout
