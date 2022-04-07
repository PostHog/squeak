import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Logo from '../components/Logo'

const navigation = [
    { name: 'All questions', href: '/questions' },
    { name: 'Profiles', href: '/profiles' },
    { name: 'Import', href: '/import' },
    { name: 'Settings', href: '/settings' },
]

function classNames(...classes: Array<unknown>) {
    return classes.filter(Boolean).join(' ')
}

interface Props {
    title: string
    navStyle?: React.CSSProperties
    contentStyle?: React.CSSProperties
}

const AdminLayout: React.FunctionComponent<Props> = ({ title, children, navStyle, contentStyle }) => {
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
            <div className="items-start flex" style={navStyle}>
                {/* Static sidebar for desktop */}
                <div className="sticky top-0 max-w-[250px] w-full">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0">
                                <Logo />
                            </div>
                            <nav className="mt-5 flex-1 px-7 space-y-1">
                                {navigation.map((item) => (
                                    <Link key={item.name} href={item.href} passHref>
                                        <a
                                            className={classNames(
                                                router.pathname === item.href
                                                    ? 'bg-gray-light bg-opacity-20 !text-red font-bold'
                                                    : 'hover:text-gray-600',
                                                'group rounded-md flex items-center px-4 py-3 text-sm font-medium text-black text-[17px]'
                                            )}
                                        >
                                            {item.name}
                                        </a>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
                <div style={contentStyle} className="flex flex-col flex-1 col-span-2">
                    <main className="flex-1">
                        <div className="py-12">
                            <div>
                                <h1 className=" mb-6">{title}</h1>
                            </div>
                            <div>{children}</div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default AdminLayout
