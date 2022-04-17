import { useState } from 'react'
import Surface from '../Surface'
import Avatar from '../Avatar'
import dayFormat from '../../util/dayFormat'
import dateToDays from '../../util/dateToDays'
import ReactMarkdown from 'react-markdown'
import DeleteButton from './DeleteButton'
import { definitions } from '../../@types/supabase'

type Reply = definitions['squeak_replies']
type Profile = definitions['squeak_profiles']

interface Props {
    reply: Reply
    profile: Profile
    hideDelete?: boolean
}

const Reply: React.FunctionComponent<Props> = ({
    reply: { id, body, created_at },
    profile: { first_name, avatar },
    hideDelete = false,
}) => {
    const [deleted, setDeleted] = useState<boolean>(false)
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
    const handleSurfaceClick = () => {
        setConfirmDelete(false)
    }
    return !deleted ? (
        <Surface onClick={handleSurfaceClick}>
            <div className={`rounded-md w-full transition-opacity`}>
                <div className={`flex space-x-4 items-start transition-opacity ${confirmDelete ? 'opacity-40' : ''}`}>
                    <Avatar className="flex-shrink-0" image={avatar} />
                    <div className="flex-grow min-w-0">
                        <p className="m-0 font-semibold">
                            <span>{first_name || 'Anonymous'}</span>
                            <span className={`ml-2 opacity-30 font-bold`}>{dayFormat(dateToDays(created_at))}</span>
                        </p>
                        <div className="bg-gray-100 p-5 rounded-md overflow-auto my-3 w-full">
                            <ReactMarkdown>{body || ''}</ReactMarkdown>
                        </div>
                    </div>
                </div>
                {!hideDelete && (
                    <p className="text-right m-0">
                        <DeleteButton
                            confirmDelete={confirmDelete}
                            setConfirmDelete={setConfirmDelete}
                            setDeleted={setDeleted}
                            id={id}
                        />
                    </p>
                )}
            </div>
        </Surface>
    ) : null
}

export default Reply
