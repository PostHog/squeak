import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import tinytime from 'tinytime'
import Avatar from '../../components/Avatar'
import Button from '../../components/Button'
import EditQuestionModal from '../../components/EditQuestionModal'
import Surface from '../../components/Surface'
import AdminLayout from '../../layout/AdminLayout'
import withAdminAccess from '../../util/withAdminAccess'

const template = tinytime('{Mo}/{DD}/{YYYY}', { padMonth: true })

const getQuestion = async (id) => {
    const { data: question } = await supabaseClient
        .from('squeak_messages')
        .select('subject, id, slug, created_at')
        .eq('id', id)
        .single()
    return supabaseClient
        .from('squeak_replies')
        .select(
            `
                id,
                created_at,
                body,
                squeak_profiles!squeak_replies_profile_id_fkey (
                    first_name, last_name, avatar
                )
                `
        )
        .eq('message_id', question?.id)
        .order('created_at')
        .then((data) => ({
            question: question,
            replies: data.data,
        }))
}

const DeleteButton = ({ id, setDeleted, confirmDelete, setConfirmDelete }) => {
    const handleClick = async () => {
        if (confirmDelete) {
            await supabaseClient.from('squeak_replies').delete().match({ id })
            setDeleted(true)
        } else {
            setConfirmDelete(true)
        }
    }
    return (
        <button onClick={handleClick} className="text-red font-bold">
            {confirmDelete ? 'Click again to confirm' : 'Delete'}
        </button>
    )
}

const Reply = ({ squeak_profiles, body, created_at, id, hideDelete }) => {
    const [deleted, setDeleted] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    return (
        !deleted && (
            <Surface>
                <div className={`pt-4 rounded-md w-full transition-opacity`}>
                    <div
                        className={`flex space-x-4 items-start transition-opacity ${confirmDelete ? 'opacity-40' : ''}`}
                    >
                        <Avatar className="flex-shrink-0" image={squeak_profiles?.avatar} />
                        <div className="flex-grow min-w-0">
                            <p className="m-0 font-semibold">
                                <span>{squeak_profiles?.first_name || 'Anonymous'}</span>
                                <span className={`font-normal ml-2`}>{template.render(new Date(created_at))}</span>
                            </p>
                            <div className="bg-gray-100 p-5 rounded-md overflow-auto my-3 w-full">
                                <ReactMarkdown>{body}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                    {!hideDelete && (
                        <p className="text-right">
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
        )
    )
}

const Question = (props) => {
    const [question, setQuestion] = useState(props.question)
    const {
        replies,
        question: { slug, subject, id },
    } = question
    const [modalOpen, setModalOpen] = useState(false)
    const handleModalSubmit = async () => {
        const updatedQuestion = await getQuestion(id)
        setQuestion(updatedQuestion)
        setModalOpen(false)
    }

    return (
        <>
            {modalOpen && (
                <EditQuestionModal
                    values={{ subject, slug, id }}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />
            )}
            <h1 class=" mb-6">{subject}</h1>
            <div className="col-span-2">
                <div className="grid gap-y-4">
                    <div className="flex space-x-9 items-start">
                        <div className="flex-grow max-w-[700px]">
                            <Reply hideDelete {...replies[0]} />
                            <div className="ml-[56px] mt-4 grid gap-y-4">
                                {replies.slice(1).map((reply) => {
                                    return <Reply key={reply.id} {...reply} />
                                })}
                            </div>
                        </div>
                        <div className="flex space-x-3 max-w-[200px] w-full flex-shrink-0 sticky top-10">
                            <Button onClick={() => setModalOpen(true)} className="w-full">
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

Question.getLayout = function getLayout(page) {
    const title = page?.props?.question?.question?.subject
    return (
        <AdminLayout
            navStyle={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(250px, 1fr) 700px 1fr' }}
        >
            {page}
        </AdminLayout>
    )
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
    async getServerSideProps(context) {
        const { id } = context.query
        const question = await getQuestion(id)
        return {
            props: { question },
        }
    },
})

export default Question
