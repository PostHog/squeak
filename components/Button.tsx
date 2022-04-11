import Link from 'next/link'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    href?: string
    loading?: boolean
}

const Button: React.FunctionComponent<Props> = ({ children, className = '', href = '', loading, ...other }) => {
    const classes = `bg-accent-light px-8 py-2 text-white rounded-md disabled:bg-opacity-40 disabled:border-opacity-0 ${className}`
    return href ? (
        <Link href={href} passHref>
            <button {...other} className={classes}>
                {children}
            </button>
        </Link>
    ) : (
        <button {...other} className={`${classes} flex justify-center items-center relative`}>
            {loading && (
                <svg
                    className="animate-spin h-5 w-5 absolute"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            <span className={loading ? 'opacity-0' : ''}>{children}</span>
        </button>
    )
}

export default Button
