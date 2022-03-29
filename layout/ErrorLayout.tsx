import Button from '../components/Button'
import Link from 'next/link'

interface Error {
    statusCode?: number
    message: string
}

interface Props {
    error: Error
}

const ErrorLayout: React.VoidFunctionComponent<Props> = ({ error }) => {
    return (
        <div className="bg-white min-h-screen px-4 py-16  lg:px-8">
            <div className="max-w-max mx-auto my-auto">
                <main>
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight text-center">Oops!</h1>
                        <p className="mt-1 text-base text-gray-500 text-center">{error.message}</p>
                        <div className="mt-10 flex justify-center space-x-3 mx-auto">
                            <Link href="/login" passHref>
                                <Button>Go to Login</Button>
                            </Link>

                            <Button href="#" className="bg-transparent border-2 border-orange-500 text-black">
                                Read the docs
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default ErrorLayout
