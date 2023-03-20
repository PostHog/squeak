import Mailgun from 'mailgun.js'
import * as formData from 'form-data'

const mailgun = new Mailgun(formData.default)

async function getClient(mailgunApiKey: string) {
    return mailgun.client({
        username: 'api',
        key: mailgunApiKey,
    })
}

export default getClient
