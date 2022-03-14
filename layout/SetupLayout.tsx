import { useRouter } from 'next/router'
import Head from 'next/head'

const nav = [
    {
        title: 'Welcome to Squeak!',
        url: '/setup/welcome',
    },
    {
        title: 'Database',
        url: '/setup/database',
    },
    {
        title: 'Administration',
        url: '/setup/administration',
    },
    {
        title: 'Thread notifications',
        url: '/setup/notifications',
    },
    {
        title: 'Moderator alerts',
        url: '/setup/alerts',
    },
    {
        title: 'Install JS snippet',
        url: '/setup/snippet',
    },
]

interface Props {
    title: string
    subtitle: string
}

const SetupLayout: React.FunctionComponent<Props> = ({ children, title, subtitle }) => {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>Squeak! | {title}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className="grid grid-cols-3 min-h-screen divide-x-2 divide-dashed divide-gray-300 setup-layout px-5">
                <aside className="flex justify-end pr-20 pt-12">
                    <nav>
                        <ul>
                            {nav.map(({ title, url }) => {
                                return (
                                    <li
                                        key={url}
                                        className={`mb-4 font-semibold relative ${
                                            router.pathname === url ? 'active-setup-tab opacity-100' : 'opacity-70'
                                        } `}
                                    >
                                        {title}
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </aside>
                <section className="col-span-2 flex justify-start pt-12 pl-20">
                    <div className=" max-w-2xl">
                        <h1 className="mb-2">{title}</h1>
                        <h2 className="opacity-70 mb-6">{subtitle}</h2>
                        <div className="mt-12">{children}</div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default SetupLayout
