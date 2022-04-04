import Link from 'next/link'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    href?: string
}

const Button: React.FunctionComponent<Props> = ({ children, className = '', href = '', ...other }) => {
    const classes = `bg-accent-light px-8 py-2 text-white rounded-md ${className}`
    return href ? (
        <Link href={href} passHref>
            <button {...other} className={classes}>
                {children}
            </button>
        </Link>
    ) : (
        <button {...other} className={classes}>
            {children}
        </button>
    )
}

export default Button
