import { Field } from 'formik'

export default function Checkbox({ label, id, name, className = '', helperText, errorMessage }) {
    return (
        <div className="mb-6 ">
            <span className="flex space-x-2 items-center">
                <label className="text-[16px] font-semibold opacity-75 my-2" htmlFor={id}>
                    {label}
                </label>
                <Field
                    type="checkbox"
                    label={label}
                    id={id}
                    name={name}
                    className={`focus:ring-red h-4 w-4 text-red border-gray-300 rounded ${className}`}
                />
            </span>
            {helperText && <p className="text-[14px] opacity-50">{helperText}</p>}
            {errorMessage && <p className="text-[14px] text-red">{errorMessage}</p>}
        </div>
    )
}
