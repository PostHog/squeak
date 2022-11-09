const cloudinary = require('cloudinary').v2

export function uploadImage(image, config) {
    cloudinary.config(config)
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, {}, (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}
