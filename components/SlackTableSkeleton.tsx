import React, { useEffect, useState } from 'react'

const Skeleton = () => {
    return (
        <tr className="relative">
            <td className="relative w-12 px-6 sm:w-16 sm:px-8 animate-pulse">
                <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 sm:left-6"
                />
            </td>

            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="w-[100px] bg-gray-light animate-pulse bg-opacity-40 rounded-md h-[2px]" />
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="w-[50px] bg-gray-light animate-pulse bg-opacity-40 rounded-md h-[2px]" />
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 ">
                <div className="overflow-hidden text-ellipsis max-w-[450px]">
                    <div className="w-[200px] bg-gray-light animate-pulse bg-opacity-40 rounded-md h-[2px]" />
                </div>
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 animate-pulse">
                <input className="max-w-[250px] border-opacity-40" />
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 animate-pulse">
                <input className="max-w-[250px] border-opacity-40" />
            </td>
            <td className="absolute inset-0 w-full h-full" />
        </tr>
    )
}

export default function SlackTableSkeleton() {
    const [skeletonsToShow, setSkeletonsToShow] = useState(1)
    useEffect(() => {
        const interval = setInterval(() => {
            setSkeletonsToShow((prevState) => prevState + 1)
        }, 2000)
        return () => clearInterval(interval)
    }, [])
    return (
        <>
            {[...Array(skeletonsToShow)].map((value, index) => (
                <Skeleton key={`skeleton-${index}`} />
            ))}
        </>
    )
}
