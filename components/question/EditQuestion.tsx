import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import slugify from 'slugify'
import { definitions } from '../../@types/supabase'
import useActiveOrganization from '../../hooks/useActiveOrganization'
import Button from '../Button'
import Checkbox from '../Checkbox'
import Input from '../Input'

type Question = definitions['squeak_messages']
type Reply = definitions['squeak_replies']

interface Props {
    permalinkBase: string
    values: Pick<Question, 'id' | 'subject' | 'published' | 'resolved' | 'permalink'>
    replyId: number
    onSubmit: (values: Pick<Question, 'subject' | 'published' | 'resolved' | 'permalink'>) => void
}

const EditQuestion: React.FunctionComponent<Props> = ({ values, replyId, onSubmit, permalinkBase }) => {
    const { subject, id, published, resolved, ...other } = values
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const router = useRouter()
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()
    const { addToast } = useToasts()
    const [permalink, setPermalink] = useState(other.permalink)

    const handleSave = async (values: {
        subject?: string
        published: boolean
        resolved: boolean
        permalink?: string
    }) => {
        setLoading(true)
        const { subject, published, resolved } = values
        let permalink = values.permalink
        if (permalink) {
            permalink = slugify(permalink, {
                lower: true,
            })
            setPermalink(permalink)
        }
        const { data: permalinkExists } = await supabaseClient
            .from('squeak_messages')
            .select('permalink')
            .match({ permalink, organization_id: organizationId })

        if (permalinkExists?.length) {
            setLoading(false)
            return addToast('Duplicate permalink', {
                appearance: 'error',
            })
        }
        await supabaseClient
            .from<Question>('squeak_messages')
            .update({ subject, published, resolved, permalink })
            .match({ id })

        await supabaseClient.from<Reply>('squeak_replies').update({ published }).match({ id: replyId })
        onSubmit({ subject, published, resolved, permalink })
        setLoading(false)
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirmDelete) {
            return setConfirmDelete(true)
        } else {
            setDeleting(true)
            await supabaseClient
                .from<Question>('squeak_messages')
                .update({ resolved_reply_id: undefined })
                .match({ id })
            await supabaseClient.from<Reply>('squeak_replies').delete().match({ message_id: id })
            await supabaseClient.from<Question>('squeak_messages').delete().match({ id })
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
                validate={(values: { subject?: string; published: boolean; resolved: boolean }) => {
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
                                <Button loading={loading} disabled={!isValid} className="mt-4 border-red border-2">
                                    Save
                                </Button>
                                <Button
                                    loading={deleting}
                                    onClick={handleDelete}
                                    className="mt-4 bg-transparent text-red border-red border-2"
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
