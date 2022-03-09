import Link from 'next/link'

export default function Button({ children, className = '', href = '', ...other }) {
    const classes = `bg-orange-500 px-8 py-2 text-white rounded-md ${className}`
    return href ? (
        <Link href={href}>
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
