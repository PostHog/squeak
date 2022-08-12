import { Field } from 'formik'
import { FieldConfig } from 'formik/dist/Field'
import { GenericFieldHTMLAttributes } from 'formik/dist/types'
import type { ChangeEvent } from 'react'

type Props<T> = GenericFieldHTMLAttributes &
    FieldConfig<T> &
    T & {
        id: string
        label: string
        name: string
        placeholder: string
        helperText?: string
        errorMessage?: string
        base?: string
        onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    }

const Input = <T,>({ label, helperText, id, name, placeholder, errorMessage, base, ...other }: Props<T>) => {
    return (
        <div className="mb-6">
            <label className="text-[16px] font-semibold opacity-75 my-2" htmlFor={id}>
                {label}
            </label>
            <div className="flex">
                {base && (
                    <span className="block px-4 py-2 bg-transparent border-gray-light border text-primary-light rounded-md rounded-r-none">
                        {base}
                    </span>
                )}
                <Field
                    {...other}
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    className={`block px-4 py-2 pr-0 border-gray-light border rounded-md w-full ${
                        base && `border-l-0 rounded-l-none`
                    }`}
                />
            </div>
            {helperText && <p className="text-[14px] opacity-50">{helperText}</p>}
            {errorMessage && <p className="text-[14px] text-red">{errorMessage}</p>}
        </div>
    )
}

export default Input
