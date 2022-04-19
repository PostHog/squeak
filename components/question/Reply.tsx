import { useState } from 'react'
import Surface from '../Surface'
import Avatar from '../Avatar'
import dayFormat from '../../util/dayFormat'
import dateToDays from '../../util/dateToDays'
import ReactMarkdown from 'react-markdown'
import DeleteButton from './DeleteButton'
import { definitions } from '../../@types/supabase'
import PublishButton from './PublishButton'

type Reply = definitions['squeak_replies']
type Profile = definitions['squeak_profiles']

interface Props {
    reply: Reply
    profile: Profile
    hidePublish?: boolean
    hideDelete?: boolean
}

const Reply: React.FunctionComponent<Props> = ({
    reply: { id, body, created_at, published: initialPublished },
    profile: { first_name, avatar },
    hidePublish = false,
    hideDelete = false,
}) => {
    const [published, setPublished] = useState(initialPublished)
    const [confirmPublish, setConfirmPublish] = useState(false)

    const [deleted, setDeleted] = useState<boolean>(false)
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)

    const handleSurfaceClick = () => {
        setConfirmPublish(false)
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
                <p className="text-right m-0">
                    {!hidePublish && (
                        <PublishButton
                            id={id}
                            published={published}
                            setPublished={setPublished}
                            confirmPublish={confirmPublish}
                            setConfirmPublish={setConfirmPublish}
                        />
                    )}
                    {!hideDelete && (
                        <DeleteButton
                            confirmDelete={confirmDelete}
                            setConfirmDelete={setConfirmDelete}
                            setDeleted={setDeleted}
                            id={id}
                        />
                    )}
                </p>
            </div>
        </Surface>
    ) : null
}

export default Reply
