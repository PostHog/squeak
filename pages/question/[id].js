import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import tinytime from 'tinytime'
import Avatar from '../../components/Avatar'
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

const QuestionView = ({ question }) => {
    const { replies } = question

    return (
        <div className="max-w-screen-lg mx-auto">
            <div className="col-span-2">
                <h1 className="mb-3">{question.question.subject}</h1>
                <div className="grid gap-y-4">
                    <Reply hideDelete {...replies[0]} />
                    <div className="ml-[56px]">
                        {replies.slice(1).map((reply) => {
                            return <Reply key={reply.id} {...reply} />
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

const Question = () => {
    const router = useRouter()
    const { id } = router.query
    const [question, setQuestion] = useState(null)
    useEffect(() => {
        getQuestion(id).then((question) => {
            setQuestion(question)
        })
    }, [id])

    return question && <QuestionView question={question} />
}

Question.getLayout = function getLayout(page) {
    return <AdminLayout>{page}</AdminLayout>
}

export const getServerSideProps = withAdminAccess({
    redirectTo: '/login',
})

export default Question
