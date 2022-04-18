import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { Dispatch, SetStateAction } from 'react'

interface Props {
    id: number | string
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
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        if (confirmPublish) {
            await supabaseClient.from('squeak_replies').update({ published: !published }).match({ id })
            setPublished(!published)
            setConfirmPublish(false)
        } else {
            setConfirmPublish(true)
        }
    }

    return (
        <button onClick={handleClick} className="text-red font-bold">
            {confirmPublish ? 'Click again to confirm' : published ? 'Unpublish' : 'Publish'}
        </button>
    )
}

export default PublishButton
