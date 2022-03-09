interface Error {
    statusCode?: number
    message: string
}

interface Props {
    error: Error
}

const ErrorLayout: React.VoidFunctionComponent<Props> = ({ error }) => {
    return <>Error: {error.message}</>
}

export default ErrorLayout
