import { Field, Form, Formik } from 'formik'
import { useToasts } from 'react-toast-notifications'
import { useCallback } from 'react'

import Modal from '../Modal'
import Button from '../Button'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import { updateQuestion } from '../../lib/api'
import { ApiResponseError } from '../../lib/api/client'

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

    const updateToast = (message: string, appearance: 'success' | 'error') => {
        addToast(message, { appearance })
    }

    const handleSave = useCallback(
        async ({ slug }: { slug: string }) => {
            if (initialValues?.slugs.find((valueSlug) => valueSlug === slug)) {
                return
            }

            // Remove the old version of the slug
            const filteredValues = initialValues?.slugs.filter((slug) => slug !== initialValues?.slug)

            const slugs = [...(filteredValues || []), slug]

            try {
                await updateQuestion(questionId, { slug: slugs })
                updateToast('Slug updated', 'success')
            } catch (error) {
                if (error instanceof ApiResponseError) {
                    updateToast(error.message, 'error')
                }
            }

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

            try {
                await updateQuestion(questionId, { slug: slugs })
                updateToast('Slug deleted', 'success')
            } catch (error) {
                if (error instanceof ApiResponseError) {
                    updateToast(error.message, 'error')
                }
            }

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
                            <div className="flex mt-3 space-x-2">
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
