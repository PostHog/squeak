export default function Surface({ children, className = '', ...other }) {
    return (
        <div {...other} className={`p-7 bg-white shadow-md rounded-md ${className}`}>
            {children}
        </div>
    )
}
