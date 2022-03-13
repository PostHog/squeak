import { useRouter } from 'next/router'
import Link from 'next/link'

const nav = [
    {
        title: 'Dashboard',
        url: '/',
    },
    {
        title: 'Questions & Replies',
        url: '/questions',
    },
    {
        title: 'Users',
        url: '/users',
    },
    {
        title: 'Settings',
        url: '/settings',
    },
]

interface Props {
    title: string
    subtitle?: string
}

const AdminLayout: React.FunctionComponent<Props> = ({ title, subtitle, children }) => {
    const router = useRouter()

    return (
        <div className="flex flex-row min-h-screen bg-gray-100 text-gray-800">
            <aside className="bg-white w-64 md:shadow">
                <div className="px-4 py-6">
                    <ul className="flex flex-col w-full">
                        {nav.map(({ title, url }) => {
                            return (
                                <li key={url} className="my-px">
                                    <Link href={url} passHref>
                                        <a
                                            className={`mb-4 font-semibold text-gray-800 ${
                                                router.pathname === url ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                                            } `}
                                        >
                                            {title}
                                        </a>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </aside>
            <main className="main flex flex-col flex-grow -ml-64 md:ml-0">
                <div className="container-main flex flex-col flex-grow p-4">
                    <h1 className="mb-2">{title}</h1>
                    <h2 className="opacity-70 mb-6">{subtitle}</h2>
                    <div className="flex flex-col flex-grow mt-4">{children}</div>
                </div>
            </main>
        </div>
    )
}

export default AdminLayout
