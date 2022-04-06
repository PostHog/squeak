import { Dialog, Transition } from '@headlessui/react'
import { ChatAlt2Icon, CogIcon, MenuIcon, UploadIcon, UsersIcon, XIcon } from '@heroicons/react/outline'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'
import Logo from '../components/Logo'

const navigation = [
    { name: 'Questions', href: '/questions', icon: ChatAlt2Icon },
    { name: 'Profiles', href: '/profiles', icon: UsersIcon },
    { name: 'Import', href: '/import', icon: UploadIcon },
]

function classNames(...classes: Array<unknown>) {
    return classes.filter(Boolean).join(' ')
}

interface Props {
    title: string
}

const AdminLayout: React.FunctionComponent<Props> = ({ title, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    return (
        <>
            <Head>
                <title>Squeak! | {title}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <div>
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                        </Transition.Child>
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                                        <button
                                            type="button"
                                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <span className="sr-only">Close sidebar</span>
                                            <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                                    <div className="flex-shrink-0 flex items-center px-4">
                                        <Logo />
                                    </div>
                                    <nav className="mt-5 px-2 space-y-1">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    router.pathname === item.href
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                    'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                                                )}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        router.pathname === item.href
                                                            ? 'text-gray-300'
                                                            : 'text-gray-400 group-hover:text-gray-300',
                                                        'mr-4 flex-shrink-0 h-6 w-6'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                                <div className="flex-shrink-0 flex p-4">
                                    <Link href="/settings" passHref>
                                        <a href="#" className="flex-shrink-0 w-full group block">
                                            <div
                                                className={classNames(
                                                    router.pathname === '/settings'
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                    'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                                                )}
                                            >
                                                <CogIcon
                                                    className={classNames(
                                                        router.pathname === '/settings'
                                                            ? 'text-gray-300'
                                                            : 'text-gray-400 group-hover:text-gray-300',
                                                        'mr-4 flex-shrink-0 h-6 w-6'
                                                    )}
                                                />
                                                <a className="text-sm font-medium text-gray-400 group-hover:text-gray-600">
                                                    Settings
                                                </a>
                                            </div>
                                        </a>
                                    </Link>
                                </div>
                            </div>
                        </Transition.Child>
                        <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-dashed border-gray-light">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <Logo />
                            </div>
                            <nav className="mt-5 flex-1 px-2 space-y-1 ">
                                {navigation.map((item) => (
                                    <Link key={item.name} href={item.href} passHref>
                                        <a
                                            className={classNames(
                                                router.pathname === item.href ? 'text-gray-700' : 'hover:text-gray-600',
                                                'group flex items-center px-2 py-2 text-sm font-medium text-gray-500'
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    router.pathname === item.href
                                                        ? 'text-gray-700'
                                                        : 'text-gray-400 group-hover:text-gray-600',
                                                    'mr-3 flex-shrink-0 h-6 w-6'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </a>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex p-4">
                            <Link href="/settings" passHref>
                                <a href="#" className="flex-shrink-0 w-full group block">
                                    <div
                                        className={classNames(
                                            router.pathname === '/settings' ? 'text-gray-700' : 'hover:text-gray-600',
                                            'group flex items-center px-2 py-2 text-sm font-medium text-gray-500'
                                        )}
                                    >
                                        <CogIcon
                                            className={classNames(
                                                router.pathname === '/settings'
                                                    ? 'text-gray-700'
                                                    : 'text-gray-400 group-hover:text-gray-600',
                                                'mr-3 flex-shrink-0 h-6 w-6'
                                            )}
                                        />
                                        <a className="text-sm font-medium text-gray-400 group-hover:text-gray-600">
                                            Settings
                                        </a>
                                    </div>
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="md:pl-64 flex flex-col flex-1">
                    <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
                        <button
                            type="button"
                            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <MenuIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <main className="flex-1">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h1 className="text-4xl font-semibold text-primary-light mb-6">{title}</h1>
                            </div>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default AdminLayout
