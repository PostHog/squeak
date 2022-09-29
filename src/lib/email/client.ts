import Mailgun from 'mailgun.js'
import formData from 'form-data'

const mailgun = new Mailgun(formData)

async function getClient(mailgunApiKey: string) {
    return mailgun.client({
        username: 'api',
        key: mailgunApiKey,
    })
}

export default getClient
