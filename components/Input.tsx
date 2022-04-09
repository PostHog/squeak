import { Field } from 'formik'

export default function Input({
    label,
    helperText,
    id,
    name,
    placeholder,
    onChange,
    ...other
}: {
    label: string
    helperText?: string
    id: string
    name: string
    placeholder: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <div className="mb-6">
            <label className="text-[16px] font-semibold opacity-75 my-2" htmlFor={id}>
                {label}
            </label>
            <Field {...other} onChange={onChange} id={id} name={name} placeholder={placeholder} />
            {helperText && <p className="text-[14px] opacity-50">{helperText}</p>}
        </div>
    )
}
