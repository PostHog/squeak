export interface EmailTemplateOptions {
    html: string
    subject: string
}

export const userInvite = (confirmationUrl: string, siteUrl: string): EmailTemplateOptions => {
    return {
        subject: 'You have been invited',
        html: `<h2>You have been invited</h2>

  <p>You have been invited to create a user on ${siteUrl}. Follow this link to accept the invite:</p>
  <p><a href="${confirmationUrl}">Accept the invite</a></p>`,
    }
}

export const confirmation = (confirmationUrl: string): EmailTemplateOptions => {
    return {
        subject: 'Confirm Your Signup',
        html: `<h2>Confirm your signup</h2>

    <p>Follow this link to confirm your user:</p>
    <p><a href="${confirmationUrl}">Confirm your mail</a></p>`,
    }
}

export const resetPassword = (confirmationUrl: string): EmailTemplateOptions => {
    return {
        subject: 'Reset Your Password',
        html: `<h2>Reset Password</h2>

  <p>Follow this link to reset the password for your user:</p>
  <p><a href="${confirmationUrl}">Reset Password</a></p>a`,
    }
}
