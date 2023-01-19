const cloudinary = require('cloudinary').v2

export function uploadImage(image, config): Promise<{ public_id: string; format: string; version: number }> {
    cloudinary.config(config)
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, { width: 80, height: 80, crop: 'fill' }, (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}
