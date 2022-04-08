import { Dialog } from '@headlessui/react'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Field, Form, Formik } from 'formik'
import { useState } from 'react'
import Button from './Button'

export default function EditQuestionModal({ onClose, values, onSubmit }) {
    const { subject, slug, id } = values
    const [loading, setLoading] = useState(false)
    const handleSave = async (values) => {
        setLoading(true)
        const { subject, slug } = values
        await supabaseClient
            .from('squeak_messages')
            .update({ subject, slug: slug.split(',') })
            .match({ id })
        onSubmit()
    }
    return (
        <Dialog className="fixed z-10 inset-0 overflow-y-auto" open={true} onClose={onClose}>
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="max-w-md w-full bg-white shadow-md rounded-md p-4 relative mx-auto my-12">
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
                    }}
                    onSubmit={handleSave}
                >
                    {({ isValid }) => {
                        return (
                            <Form>
                                <label className="mt-0" htmlFor="subject">
                                    Subject
                                </label>
                                <Field id="subject" name="subject" placeholder="Subject" />
                                <label htmlFor="slug">Slug</label>
                                <Field id="slug" name="slug" placeholder="Slug" />
                                <Button loading={loading} disabled={!isValid} className="mt-4">
                                    Save
                                </Button>
                            </Form>
                        )
                    }}
                </Formik>
            </div>
        </Dialog>
    )
}
