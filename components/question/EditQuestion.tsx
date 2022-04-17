import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Input from '../Input'
import Button from '../Button'
import { definitions } from '../../@types/supabase'
import Checkbox from '../Checkbox'

type Question = definitions['squeak_messages']

interface Props {
    values: Pick<Question, 'id' | 'subject' | 'slug' | 'published' | 'resolved'>
    onSubmit: (values: Pick<Question, 'subject' | 'slug' | 'published' | 'resolved'>) => void
}

const EditQuestion: React.FunctionComponent<Props> = ({ values, onSubmit }) => {
    const { subject, slug, id, published, resolved } = values
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const router = useRouter()

    const handleSave = async (values: { subject?: string; slug?: string; published: boolean; resolved: boolean }) => {
        setLoading(true)
        const { subject, slug = '', published, resolved } = values
        await supabaseClient
            .from('squeak_messages')
            .update({ subject, slug: slug.split(','), published, resolved })
            .match({ id })
        onSubmit({ subject, slug: slug.split(','), published, resolved })
        setLoading(false)
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirmDelete) {
            return setConfirmDelete(true)
        } else {
            setDeleting(true)
            await supabaseClient.from('squeak_messages').update({ resolved_reply_id: null }).match({ id })
            await supabaseClient.from('squeak_replies').delete().match({ message_id: id })
            await supabaseClient.from('squeak_messages').delete().match({ id })
            router.push('/questions')
        }
    }

    const handleContainerClick = () => {
        setConfirmDelete(false)
    }

    return (
        <div onClick={handleContainerClick} className="relative">
            <Formik
                validateOnMount
                validate={(values: { subject?: string; slug?: string; published: boolean; resolved: boolean }) => {
                    const errors: { subject?: string; slug?: string } = {}
                    if (!values.subject) {
                        errors.subject = 'Required'
                    }
                    if (!values.slug) {
                        errors.slug = 'Required'
                    }
                    return errors
                }}
                initialValues={{
                    subject,
                    slug: (slug as Array<string>).join(','),
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
                                helperText="SEO-friendly text, also used to derive permalink"
                            />
                            <Input
                                label="Show this question on..."
                                id="slug"
                                name="slug"
                                placeholder="Slug"
                                helperText="Separate multiple relative URLs with commas. Ex: /docs/api, /docs/other-url"
                            />
                            <Checkbox
                                label="Published"
                                id="published"
                                name="published"
                                helperText="Uncheck to hide from page(s)"
                            />
                            <Checkbox label="Resolved" id="resolved" name="resolved" />
                            <div className="flex justify-between">
                                <Button loading={loading} disabled={!isValid} className="mt-4 border-red border-2">
                                    Save
                                </Button>
                                <Button
                                    loading={deleting}
                                    onClick={handleDelete}
                                    className="mt-4 bg-transparent text-red border-red border-2"
                                >
                                    {confirmDelete ? 'Permanently delete from site?' : 'Delete thread'}
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
