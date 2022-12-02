import { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import Input from './Input'
import { Combobox } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { XIcon } from '@heroicons/react/solid'
import ImageUpload from './ImageUpload'
import Button from './Button'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MDEditor: any = dynamic(
    // @ts-ignore
    import('@uiw/react-md-editor').then((mod) => mod.default),
    { ssr: false }
)

const Update = ({
    onSubmit,
    handleDelete,
    initialValues,
    submitText = 'Add goal',
    categories,
    config,
    allowNotify = false,
    notify,
    handleNotify,
}) => {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [query, setQuery] = useState('')
    const filteredCategories =
        query === ''
            ? categories
            : categories.filter((category) => {
                  return category.toLowerCase().includes(query.toLowerCase())
              })
    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ values, setFieldValue }) => {
                return (
                    <Form>
                        <div className="flex space-x-6">
                            <div className="flex-grow">
                                <Input value={values.title} label="Title" id="title" name="title" placeholder="Title" />
                                <Input
                                    id="description"
                                    value={values.description}
                                    as={'textarea'}
                                    label="Description"
                                    name="description"
                                    placeholder="Description"
                                />

                                {values.complete && (
                                    <Input
                                        value={values.date_completed}
                                        label="Date completed"
                                        id="date_completed"
                                        name="date_completed"
                                        placeholder="Date completed"
                                        type="date"
                                    />
                                )}
                                {!values.complete && (
                                    <Input
                                        value={values.projected_completion_date}
                                        label="Projected completion date"
                                        id="projected_completion_date"
                                        name="projected_completion_date"
                                        placeholder="Projected completion date"
                                        type="date"
                                    />
                                )}
                                <div className="mb-6">
                                    <label className="text-[16px] font-semibold opacity-75 my-2" htmlFor={'category'}>
                                        Category
                                    </label>
                                    <Combobox
                                        value={values.category}
                                        onChange={(category) => setFieldValue('category', category)}
                                    >
                                        <div className="relative">
                                            <Combobox.Input
                                                id="category"
                                                className="block px-4 py-2 pr-0 border-gray-light border rounded-md w-full"
                                                onChange={(event) => {
                                                    setFieldValue('category', event.target.value)
                                                    setQuery(event.target.value)
                                                }}
                                            />
                                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </Combobox.Button>
                                        </div>
                                        <Combobox.Options className="shadow-md rounded-md">
                                            {filteredCategories.map((category) => (
                                                <Combobox.Option
                                                    className="cursor-pointer m-0 py-3 px-2 "
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </Combobox.Option>
                                            ))}
                                        </Combobox.Options>
                                    </Combobox>
                                </div>

                                {values.github_urls.map((issue, index) => {
                                    return (
                                        <div key={index} className="flex items-center space-x-2">
                                            <div className="flex-grow">
                                                <Input
                                                    id="github-url"
                                                    value={values.github_urls[index]}
                                                    label="GitHub URL"
                                                    name={`github_urls[${index}]`}
                                                    placeholder="GitHub URL"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const issues = [...values.github_urls]
                                                    issues.splice(index, 1)
                                                    setFieldValue('github_urls', issues)
                                                }}
                                            >
                                                <XIcon className="w-4 text-[red]" />
                                            </button>
                                        </div>
                                    )
                                })}
                                <button
                                    type="button"
                                    onClick={() => setFieldValue('github_urls', [...values.github_urls, ''])}
                                    className="text-red font-bold mb-6"
                                >
                                    Add GitHub URL
                                </button>
                            </div>
                            <div className="w-48">
                                {config.cloudinary_cloud_name && (
                                    <ImageUpload
                                        onChange={(file) => setFieldValue('image', file)}
                                        value={values.image}
                                    />
                                )}
                                <div className="flex items-center space-x-2 my-6">
                                    <label
                                        className="text-[16px] font-semibold opacity-75 flex-shrink-0 m-0"
                                        htmlFor="complete"
                                    >
                                        Complete
                                    </label>
                                    <Field type="checkbox" name="complete" id="complete" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center space-x-2 mb-6">
                                        <label
                                            className="text-[16px] font-semibold opacity-75 flex-shrink-0 m-0"
                                            htmlFor="milestone"
                                        >
                                            Milestone
                                        </label>
                                        <Field type="checkbox" name="milestone" id="milestone" />
                                    </div>

                                    <div className="flex items-center space-x-2 mb-6">
                                        <label
                                            className="text-[16px] font-semibold opacity-75 flex-shrink-0 m-0"
                                            htmlFor="beta_available"
                                        >
                                            Beta available
                                        </label>
                                        <Field type="checkbox" name="beta_available" id="beta_available" />
                                    </div>
                                </div>
                                {allowNotify && (
                                    <div className="flex items-center space-x-2 pt-6 border-t border-gray-300 border-dashed">
                                        <label
                                            className="text-[16px] font-semibold opacity-75 flex-shrink-0 m-0"
                                            htmlFor="notify"
                                        >
                                            Notify subscribers
                                        </label>
                                        <input id="notify" type="checkbox" onChange={handleNotify} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center mt-4 space-x-2 justify-between">
                            {handleDelete && (
                                <Button
                                    onClick={() => {
                                        if (!confirmDelete) return setConfirmDelete(true)
                                        handleDelete()
                                    }}
                                    type="button"
                                >
                                    {confirmDelete ? 'Click to confirm' : 'Delete'}
                                </Button>
                            )}
                            <Button>{notify ? `Next` : submitText}</Button>
                        </div>
                    </Form>
                )
            }}
        </Formik>
    )
}

const updatesToMD = (title = '', updates = []) => `## ${title} \n${updates.map((update) => `- ${update}\n`).join('')}`

const Notify = ({ subscribers, handleBack, onSubmit, updates, title }) => {
    const [emailContent, setEmailContent] = useState(updatesToMD(title, updates))
    const [subject, setSubject] = useState('New roadmap update!')
    const [loading, setLoading] = useState(false)
    const [viewSubscribers, setViewSubscribers] = useState(false)
    const subscriberCount = subscribers.length

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        onSubmit && (await onSubmit({ content: emailContent, subject }))
    }

    useEffect(() => {
        setEmailContent(updatesToMD(title, updates))
    }, [updates, title])

    return (
        <form onSubmit={handleSubmit}>
            <label className="text-[16px] font-semibold opacity-75 mb-2" htmlFor="subject">
                Subject
            </label>
            <input
                className="block px-4 py-2 pr-0 border-gray-light border rounded-md w-full"
                id="subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />
            <div className="mt-4">
                <label className="text-[16px] font-semibold opacity-75 mb-2" htmlFor="content">
                    Content
                </label>
                {/* @ts-ignore */}
                <MDEditor id="content" name="content" height={350} value={emailContent} onChange={setEmailContent} />
            </div>
            <div className=" my-6">
                {subscribers?.length > 0 && !viewSubscribers && (
                    <button className="text-red font-semibold" onClick={() => setViewSubscribers(true)}>
                        View subscribers
                    </button>
                )}
                {viewSubscribers && (
                    <ul className="max-h-52 overflow-auto py-2 px-4 border border-dashed border-gray-400 rounded-md">
                        {subscribers.map((subscriber) => {
                            const { id, email, first_name, last_name, user } = subscriber
                            return (
                                <li className="text-sm" key={id}>
                                    <Link href={`/profiles/${id}`}>
                                        {`${first_name} ${last_name} (${user?.email})`}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
            <div className="flex items-center mt-4 space-x-2 justify-between">
                <Button type="button" onClick={handleBack}>
                    Back
                </Button>
                <Button loading={loading} disabled={loading || emailContent.trim().length <= 0}>
                    Update & notify {`${subscriberCount} subscriber${subscriberCount === 1 ? '' : 's'}`}
                </Button>
            </div>
        </form>
    )
}

export const RoadmapForm = (props) => {
    const [notify, setNotify] = useState(false)
    const [step, setStep] = useState(0)
    const [values, setValues] = useState({})
    const [updates, setUpdates] = useState<string[]>([])
    const { subscribers, onSubmit, ...other } = props

    const handleNotify = (e) => {
        setNotify(e.target.checked)
    }

    const handleUpdateSubmit = (values) => {
        if (notify) {
            setStep(1)
            setValues(values)
            const updates: string[] = []
            const valueKeys = Object.keys(props.initialValues)
            const getUpdate = (key, oldValue, newValue) => {
                switch (key) {
                    case 'beta_available':
                        return oldValue !== newValue && !oldValue && newValue && 'Beta is now available'
                    case 'complete':
                        return oldValue !== newValue && !oldValue && newValue && 'Goal is now complete'
                }
            }
            valueKeys.forEach((key) => {
                const oldValue = props.initialValues[key]
                const newValue = values[key]
                const update = getUpdate(key, oldValue, newValue)
                if (update) updates.push(update)
            })
            setUpdates(updates)
        } else {
            onSubmit && onSubmit(values)
        }
    }

    const handleNotifySubmit = async ({ content, subject }) => {
        await fetch('/api/roadmap/notify', {
            method: 'POST',
            body: JSON.stringify({
                emails: subscribers.map((subscriber) => subscriber.user?.email),
                content,
                subject,
            }),
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
        onSubmit && onSubmit(values)
    }

    const handleBack = () => {
        setStep(0)
        setNotify(false)
    }

    return step === 0 ? (
        <Update {...other} onSubmit={handleUpdateSubmit} handleNotify={handleNotify} notify={notify} />
    ) : (
        <Notify
            title={other.initialValues.title}
            updates={updates}
            onSubmit={handleNotifySubmit}
            handleBack={handleBack}
            subscribers={subscribers}
        />
    )
}
