import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { deleteQuestion, updateQuestion } from '../../lib/api/'
import Button from '../Button'
import Checkbox from '../Checkbox'
import Input from '../Input'
import { Question } from '@prisma/client'

interface Props {
    values: Pick<Question, 'id' | 'subject' | 'published' | 'resolved'>
    replyId: number
    onSubmit: (values: Pick<Question, 'subject' | 'published' | 'resolved'>) => void
}

interface IValues {
    subject: string | null
    published: boolean
    resolved: boolean
}

const EditQuestion: React.FunctionComponent<Props> = ({ values, replyId, onSubmit }) => {
    const { subject, id, published, resolved } = values
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const router = useRouter()

    const handleSave = async (values: IValues) => {
        setLoading(true)
        const { subject, published, resolved } = values
        await updateQuestion(id, { subject, published, resolved, replyId })
        onSubmit({ subject, published, resolved })
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
