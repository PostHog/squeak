import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { Dispatch, SetStateAction } from 'react'

interface Props {
    id: number | string
    setDeleted: Dispatch<SetStateAction<boolean>>
    confirmDelete: boolean
    setConfirmDelete: Dispatch<SetStateAction<boolean>>
}

const DeleteButton: React.FunctionComponent<Props> = ({ id, setDeleted, confirmDelete, setConfirmDelete }) => {
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        if (confirmDelete) {
            await supabaseClient.from('squeak_replies').delete().match({ id })
            setDeleted(true)
        } else {
            setConfirmDelete(true)
        }
    }

    return (
        <button onClick={handleClick} className="ml-4 text-red font-bold">
            {confirmDelete ? 'Click again to confirm' : 'Delete'}
        </button>
    )
}

export default DeleteButton
