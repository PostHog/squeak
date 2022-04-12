import { Dialog } from '@headlessui/react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Input from '../components/Input'
import Button from './Button'
import Checkbox from './Checkbox'

export default function EditQuestionModal({ onClose, values, onSubmit }) {
    const { subject, slug, id, published } = values
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const router = useRouter()

    const handleSave = async (values) => {
        setLoading(true)
        const { subject, slug, published } = values
        await supabaseClient
            .from('squeak_messages')
            .update({ subject, slug: slug.split(','), published })
            .match({ id })
        onSubmit()
    }

    const handleDelete = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirmDelete) {
            return setConfirmDelete(true)
        } else {
            setDeleting(true)
            await supabaseClient.from('squeak_replies').delete().match({ message_id: id })
            await supabaseClient.from('squeak_messages').delete().match({ id })
            router.push('/questions')
        }
    }

    const handleContainerClick = () => {
        setConfirmDelete(false)
    }

    return (
        <Dialog className="fixed z-10 inset-0 overflow-y-auto" open={true} onClose={onClose}>
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div
                onClick={handleContainerClick}
                className="max-w-md w-full bg-white shadow-md rounded-md p-4 relative mx-auto my-12"
            >
                <Formik
                    validateOnMount
                    validate={(values) => {
                        const errors = {}
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
                        slug: slug.join(','),
                        published,
                    }}
                    onSubmit={handleSave}
                >
                    {({ isValid }) => {
                        return (
                            <Form>
                                <Input label="Title" id="subject" name="subject" placeholder="Title" helperText="SEO-friendly text, also used to derive permalink" />
                                <Input label="Show this question on..." id="slug" name="slug" placeholder="Slug" helperText="URL(s) where this question should appear. (Separate multiple relative URLs with commas. Ex: /docs/api, /docs/other-url)" />
                                <Checkbox label="Published" id="published" name="published" helperText="Uncheck to hide from page(s)" />
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
        </Dialog>
    )
}