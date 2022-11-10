import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Logo from '../components/Logo'
import posthog from 'posthog-js'
import usePostHog from '../hooks/usePostHog'
import { logout } from '../lib/api/auth'

const navigation = [
    { name: 'Questions', href: '/questions' },
    { name: 'Topics', href: '/topics' },
    { name: 'Profiles', href: '/profiles' },
    { name: 'Teams', href: '/teams' },
    { name: 'Roadmap', href: '/roadmap' },
    { name: 'Import Slack threads', href: '/slack' },
    { name: 'Settings', href: '/settings' },
]

function classNames(...classes: Array<unknown>) {
    return classes.filter(Boolean).join(' ')
}

interface Props {
    title: string
    navStyle?: React.CSSProperties
    contentStyle?: React.CSSProperties
    hideTitle?: boolean
    children: React.ReactNode
}

const AdminLayout: React.FunctionComponent<Props> = ({ title, children, navStyle, contentStyle, hideTitle }) => {
    const router = useRouter()
    usePostHog()

    const handleLogout = async () => {
        await logout()
        posthog?.reset()
        router.push('/login')
    }

    return (
        <>
            <Head>
                <title>Squeak! | {title}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <div>
                <div className="fixed inset-y-0 flex w-64 flex-col">
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                            <div className="flex flex-shrink-0 items-center px-4">
                                <div className="w-32">
                                    <Logo />
                                </div>
                            </div>
                            <nav className="mt-5 flex-1 space-y-1 px-2">
                                {navigation.map((item) => (
                                    <Link key={item.name} href={item.href} passHref>
                                        <a
                                            className={classNames(
                                                router.pathname === item.href
                                                    ? 'bg-gray-light bg-opacity-20 !text-red font-bold'
                                                    : 'hover:text-gray-600 hover:bg-gray-light hover:bg-opacity-10 active:bg-opacity-20 hover:text-black',
                                                'group rounded-md flex items-center px-4 py-3 text-sm font-medium text-black text-[17px]'
                                            )}
                                        >
                                            {item.name}
                                        </a>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="flex flex-shrink-0 p-4">
                            <div className="flex items-center w-full">
                                <button
                                    onClick={handleLogout}
                                    className={classNames(
                                        'hover:text-gray-600 hover:bg-gray-light hover:bg-opacity-10 active:bg-opacity-20 hover:text-black group rounded-md flex w-full items-center px-4 py-3 text-sm font-medium text-black text-[17px]'
                                    )}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-1 flex-col md:pl-64">
                    <main className="flex-1">
                        <div className="py-6">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                                {!hideTitle && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
                            </div>
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default AdminLayout
