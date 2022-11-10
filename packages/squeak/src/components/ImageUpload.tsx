import Image from 'next/image'
import React, { useEffect, useState } from 'react'

export default function ImageUpload({ value, name = 'image', id = 'image', onChange }) {
    const [image, setImage] = useState<string | null>(null)

    const handleChange = (e) => {
        const file = e.currentTarget.files[0]
        onChange && onChange(file)
    }

    useEffect(() => {
        if (!value) return setImage(null)
        if (value.id) {
            return setImage(
                `https://res.cloudinary.com/${value.cloud_name}/v${value.version}/${value.publicId}.${value.format}`
            )
        }
        const reader = new FileReader()

        reader.onloadend = () => {
            reader?.result && setImage(reader.result as string)
        }

        reader.readAsDataURL(value)
    }, [value])

    return (
        <div className="relative h-48 w-48 border border-gray-accent-light dark:border-gray-accent-dark border-dashed rounded-md flex justify-center items-center text-black/50 dark:text-white/50">
            {image ? (
                <img className="w-full h-full absolute inset-0 object-cover rounded-sm" src={image} alt={name} />
            ) : (
                <p className="text-sm text-black/70">Click to upload image</p>
            )}
            <input
                accept=".jpg, .png, .gif, .jpeg"
                onChange={handleChange}
                className="opacity-0 absolute w-full h-full inset-0 cursor-pointer"
                name={name}
                id={id}
                type="file"
            />
        </div>
    )
}
