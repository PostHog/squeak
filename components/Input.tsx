import { Field } from 'formik'
import type { ChangeEvent } from 'react'
import { GenericFieldHTMLAttributes } from 'formik/dist/types'
import { FieldConfig } from 'formik/dist/Field'

type Props<T> = GenericFieldHTMLAttributes &
    FieldConfig<T> &
    T & {
        id: string
        label: string
        name: string
        placeholder: string
        helperText?: string
        errorMessage?: string
        onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    }

const Input = <T,>({ label, helperText, id, name, placeholder, errorMessage, ...other }: Props<T>) => {
    return (
        <div className="mb-6">
            <label className="text-[16px] font-semibold opacity-75 my-2" htmlFor={id}>
                {label}
            </label>
            <Field
                {...other}
                id={id}
                name={name}
                placeholder={placeholder}
                className="block px-4 py-2 border-gray-light border rounded-md w-full"
            />
            {helperText && <p className="text-[14px] opacity-50">{helperText}</p>}
            {errorMessage && <p className="text-[14px] text-red">{errorMessage}</p>}
        </div>
    )
}

export default Input
