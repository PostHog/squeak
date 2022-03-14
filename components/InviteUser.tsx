import Button from './Button'
import { useState } from 'react'
import classNames from 'classnames'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onInvite?: () => void
}

const InviteUser: React.VoidFunctionComponent<Props> = ({ onInvite, className, ...rest }) => {
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [role, setRole] = useState('admin')
    const [showInput, setShowInput] = useState(false)

    const handleInvite = async () => {
        await fetch('/api/user/invite', {
            method: 'POST',
            body: JSON.stringify({ email, firstName, role }),
        })

        if (onInvite) {
            onInvite()
        }

        setShowInput(false)
    }

    return showInput ? (
        <div className={classNames(className, 'space-x-2')}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="User's email"
                className="inline px-4 py-2 border-gray-300 border rounded-md"
            />
            <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="User's first name"
                className="inline px-4 py-2 border-gray-300 border rounded-md"
            />
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="inline px-4 py-2 border-gray-300 border rounded-md"
            >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
            </select>
            <Button onClick={handleInvite}>Invite</Button>
        </div>
    ) : (
        <Button onClick={() => setShowInput(true)} className={className} {...rest}>
            Invite User
        </Button>
    )
}

export default InviteUser
