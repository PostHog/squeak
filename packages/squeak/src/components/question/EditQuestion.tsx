import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'

import { deleteQuestion, updateQuestion } from '../../lib/api/'
import Button from '../Button'
import Checkbox from '../Checkbox'
import Input from '../Input'
import { Question } from '@prisma/client'

interface Props {
    permalinkBase: string
    values: Pick<Question, 'id' | 'subject' | 'published' | 'resolved' | 'permalink'>
    replyId: number
    onSubmit: (values: Pick<Question, 'subject' | 'published' | 'resolved' | 'permalink'>) => void
}

interface IValues {
    subject: string | null
    published: boolean
    resolved: boolean
    permalink: string | null
}

const EditQuestion: React.FunctionComponent<Props> = ({ values, replyId, onSubmit, permalinkBase }) => {
    const { subject, id, published, resolved, permalink } = values
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const router = useRouter()
    const { addToast } = useToasts()

    const handleSave = async (values: IValues) => {
        setLoading(true)
        const { subject, published, resolved, permalink } = values
        try {
            await updateQuestion(id, { subject, published, resolved, replyId, permalink })
            onSubmit({ subject, published, resolved, permalink })
        } catch (err) {
            if (err instanceof Error) {
                addToast(err.message, { appearance: 'error' })
            }
        }

        setLoading(false)
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirmDelete) {
            return setConfirmDelete(true)
        } else {
            setDeleting(true)
            await deleteQuestion(id)
            router.push('/questions')
        }
    }

    const handleContainerClick = () => {
        setConfirmDelete(false)
    }

    return (
        <div onClick={handleContainerClick} className="relative">
            <Formik
                enableReinitialize
                validateOnMount
                validate={(values: IValues) => {
                    const errors: { subject?: string } = {}
                    if (!values.subject) {
                        errors.subject = 'Required'
                    }
                    return errors
                }}
                initialValues={{
                    subject,
                    published,
                    resolved,
                    permalink,
                }}
                onSubmit={handleSave}
            >
                {({ isValid }) => {
                    return (
                        <Form>
                            <Input
                                label="Title"
                                id="subject"
                                name="subject"
                                placeholder="Title"
                                helperText="SEO-friendly summary of the topic"
                            />
                            <Checkbox
                                label="Published"
                                id="published"
                                name="published"
                                helperText="Check to show on page(s)"
                            />
                            <Checkbox
                                label="Resolved"
                                id="resolved"
                                name="resolved"
                                helperText="Check to mark as solved"
                            />
                            <Input
                                base={`/${permalinkBase}/`}
                                label="Permalink"
                                id="permalink"
                                name="permalink"
                                placeholder="Permalink"
                                helperText="Where the question appears on your site"
                            />
                            <div className="flex space-x-4">
                                <Button
                                    loading={loading}
                                    disabled={!isValid}
                                    className="mt-4 border-2 border-red"
                                    type="submit"
                                >
                                    Save
                                </Button>
                                <Button
                                    loading={deleting}
                                    onClick={handleDelete}
                                    className="mt-4 bg-transparent border-2 text-red border-red"
                                >
                                    {confirmDelete ? 'Permanently delete from site?' : 'Delete'}
                                </Button>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

export default EditQuestion
