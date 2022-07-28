import type { Dispatch, SetStateAction } from 'react'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import { updateReply } from '../../lib/api/'

interface Props {
    id: number | string | bigint
    published: boolean
    setPublished: Dispatch<SetStateAction<boolean>>
    confirmPublish: boolean
    setConfirmPublish: Dispatch<SetStateAction<boolean>>
}

const PublishButton: React.FunctionComponent<Props> = ({
    id,
    published,
    setPublished,
    confirmPublish,
    setConfirmPublish,
}) => {
    const { getActiveOrganization } = useActiveOrganization()
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        if (confirmPublish) {
            await updateReply(id, { published: !published, organizationId: getActiveOrganization() })
            setPublished(!published)
            setConfirmPublish(false)
        } else {
            setConfirmPublish(true)
        }
    }

    return (
        <button onClick={handleClick} className="font-bold text-red">
            {confirmPublish ? 'Click again to confirm' : published ? 'Unpublish' : 'Publish'}
        </button>
    )
}

export default PublishButton
