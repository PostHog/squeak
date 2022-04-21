import Modal from '../Modal'
import { Field, Form, Formik } from 'formik'
import Button from '../Button'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useToasts } from 'react-toast-notifications'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import { definitions } from '../../@types/supabase'
import { useCallback } from 'react'

type Question = definitions['squeak_messages']

interface Props {
    questionId: number
    open?: boolean
    initialValues: { slugs: string[]; slug: string } | null
    onSubmit: () => void
    onClose: () => void
}

const SlugModal: React.VoidFunctionComponent<Props> = ({ questionId, open, onClose, onSubmit, initialValues }) => {
    const { addToast } = useToasts()
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()

    const handleSave = useCallback(
        async ({ slug }: { slug: string }) => {
            if (initialValues?.slugs.find((valueSlug) => valueSlug === slug)) {
                return
            }

            // Remove the old version of the slug
            const filteredValues = initialValues?.slugs.filter((slug) => slug !== initialValues?.slug)

            const slugs = [...(filteredValues || []), slug]

            const { error } = await supabaseClient
                .from<Question>('squeak_messages')
                .update({ slug: slugs })
                .match({ organization_id: organizationId, id: questionId })

            addToast(error ? error.message : 'Slug added', {
                appearance: error ? 'error' : 'success',
            })

            onSubmit()
        },
        [addToast, initialValues?.slugs, onSubmit, organizationId, questionId]
    )

    const handleDelete = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()

            if (!initialValues) {
                return
            }

            if (!initialValues.slugs.find((slug) => slug === initialValues.slug)) {
                return
            }

            const slugs = initialValues.slugs.filter((slug) => slug !== initialValues.slug)

            const { error } = await supabaseClient
                .from<Question>('squeak_messages')
                .update({ slug: slugs })
                .match({ organization_id: organizationId, id: questionId })

            addToast(error ? error.message : 'Slug deleted', {
                appearance: error ? 'error' : 'success',
            })

            onSubmit()
        },
        [addToast, initialValues, onSubmit, organizationId, questionId]
    )

    return (
        <Modal onClose={onClose} open={open}>
            <Formik
                validateOnMount
                validate={(values) => {
                    const errors: { slug?: string } = {}

                    if (!values.slug) {
                        errors.slug = 'Required'
                    }

                    return errors
                }}
                initialValues={{ slug: initialValues?.slug || '' }}
                onSubmit={handleSave}
            >
                {({ isValid }) => {
                    return (
                        <Form>
                            <label htmlFor="slug">Slug</label>
                            <Field id="slug" name="slug" placeholder="/foo/bar" type="text" />
                            <p className="text-sm opacity-70">Ex: /foo/bar</p>
                            <div className="flex space-x-2 mt-3">
                                <Button disabled={!isValid} type="submit">
                                    {initialValues?.slug !== '' ? 'Save' : 'Add'}
                                </Button>
                                {initialValues?.slug !== '' && (
                                    <Button onClick={handleDelete} className="bg-red-500">
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </Modal>
    )
}

export default SlugModal
