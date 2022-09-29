import Button from './Button'
import { useState } from 'react'
import classNames from 'classnames'
import useActiveOrganization from '../hooks/useActiveOrganization'
import { useToasts } from 'react-toast-notifications'
import { doPost } from '../lib/api'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onInvite?: () => void
}

const InviteUser: React.VoidFunctionComponent<Props> = ({ onInvite, className, ...rest }) => {
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()

    const { addToast } = useToasts()

    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [role, setRole] = useState('admin')
    const [showInput, setShowInput] = useState(false)

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        await doPost('/api/user/invite', { email, firstName, role, organizationId })

        if (onInvite) {
            onInvite()
        }

        addToast('User invited', {
            appearance: 'success',
        })

        setShowInput(false)
        setFirstName('')
        setEmail('')
    }

    return showInput ? (
        <form className={classNames(className, 'space-x-2 inline-flex')} onSubmit={handleInvite}>
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="User's email"
                className="inline px-4 py-2 border rounded-md border-gray-light"
            />
            <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="User's first name"
                className="inline px-4 py-2 border rounded-md border-gray-light"
            />
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="inline px-4 py-2 border rounded-md border-gray-light"
            >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
            </select>
            <Button type="submit">Invite</Button>
        </form>
    ) : (
        <Button onClick={() => setShowInput(true)} className={className} {...rest}>
            Invite a moderator/admin
        </Button>
    )
}

export default InviteUser
