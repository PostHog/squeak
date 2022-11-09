import type { Dispatch, SetStateAction } from 'react'

import { deleteReply } from '../../lib/api/replies'

interface Props {
    id: number | string | bigint
    setDeleted: Dispatch<SetStateAction<boolean>>
    confirmDelete: boolean
    setConfirmDelete: Dispatch<SetStateAction<boolean>>
}

const DeleteButton: React.FunctionComponent<Props> = ({ id, setDeleted, confirmDelete, setConfirmDelete }) => {
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        if (confirmDelete) {
            await deleteReply(id)
            setDeleted(true)
        } else {
            setConfirmDelete(true)
        }
    }

    return (
        <button onClick={handleClick} className="ml-4 font-bold text-red">
            {confirmDelete ? 'Click again to confirm' : 'Delete'}
        </button>
    )
}

export default DeleteButton
