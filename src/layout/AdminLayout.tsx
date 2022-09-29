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
            <div className="flex items-start" style={navStyle}>
                {/* Static sidebar for desktop */}
                <div className="sticky top-0 w-full grow-0 shrink-0 basis-[300px] md:mr-8">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="pt-8 pb-4 overflow-y-auto">
                        <Logo />
                        <nav className="px-7 space-y-[1px]">
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
                            <button
                                onClick={handleLogout}
                                className={classNames(
                                    'hover:text-gray-600 hover:bg-gray-light hover:bg-opacity-10 active:bg-opacity-20 hover:text-black group rounded-md flex w-full items-center px-4 py-3 text-sm font-medium text-black text-[17px]'
                                )}
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
                <main style={contentStyle} className="flex flex-col flex-1 col-span-2 py-12 pr-4">
                    {!hideTitle && <h1 className="pb-2">{title}</h1>}
                    {children}
                </main>
            </div>
        </>
    )
}

export default AdminLayout
