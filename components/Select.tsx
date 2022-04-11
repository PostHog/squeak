import { Field } from 'formik'

export default function Select({
    label,
    helperText,
    id,
    name,
    options,
    ...other
}: {
    label: string
    helperText?: string
    id: string
    name: string
    options: { name: string; id: string }[]
}) {
    return (
        <div className="mb-6">
            <label className="text-[16px] font-semibold opacity-75 my-2" htmlFor={id}>
                {label}
            </label>
            <Field as="select" {...other} id={id} name={name}>
                {options.map(({ name, id }) => {
                    return (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    )
                })}
            </Field>
            {helperText && <p className="text-[14px] opacity-50">{helperText}</p>}
        </div>
    )
}
