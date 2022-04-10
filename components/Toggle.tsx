import { Switch } from '@headlessui/react'
import { Dispatch, SetStateAction } from 'react'

export default function Toggle({
    checked,
    setChecked,
    label,
    className = '',
}: {
    checked: boolean
    setChecked: Dispatch<SetStateAction<boolean>>
    label: string
    className: string
}) {
    return (
        <div className={`${className}`}>
            <Switch.Group>
                <Switch.Label className="text-[16px] font-semibold opacity-75 my-2">{label}</Switch.Label>
                <Switch
                    checked={checked}
                    onChange={setChecked}
                    className={`${
                        checked ? 'bg-red' : 'bg-light'
                    } relative inline-flex items-center h-6 rounded-full w-11`}
                >
                    <span
                        className={`${
                            checked ? 'translate-x-6' : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full`}
                    />
                </Switch>
            </Switch.Group>
        </div>
    )
}
