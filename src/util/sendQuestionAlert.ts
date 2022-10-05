import prisma from '../lib/db'

const sendQuestionAlert = async (
    organizationId: string,
    messageId: bigint,
    subject: string,
    body: string,
    slug: string,
    profileId: string
) => {
    const webhooks = await prisma.webhookConfig.findMany({
        where: { organization_id: organizationId },
        select: {
            url: true,
            type: true,
            id: true,
        },
    })

    Promise.all(
        webhooks.map(async ({ url, type }) => {
            switch (type) {
                case 'webhook':
                    return fetch(url, { method: 'POST', body: JSON.stringify({ subject, slug, body }) })
                case 'slack':
                    const profile = await prisma.profile.findFirst({
                        where: {
                            id: profileId,
                            organization_id: organizationId,
                        },
                    })

                    if (!profile) return

                    const { first_name, avatar } = profile
                    return fetch(url, {
                        method: 'POST',
                        body: JSON.stringify({
                            text: `Question asked on ${slug[0]}`,
                            blocks: [
                                {
                                    type: 'header',
                                    text: {
                                        type: 'plain_text',
                                        text: `${first_name} on ${slug}`,
                                        emoji: true,
                                    },
                                },
                                {
                                    type: 'header',
                                    text: {
                                        type: 'plain_text',
                                        text: subject,
                                        emoji: true,
                                    },
                                },
                                {
                                    type: 'section',
                                    text: {
                                        type: 'mrkdwn',
                                        text: body,
                                    },
                                    ...(avatar && {
                                        accessory: {
                                            type: 'image',
                                            image_url: avatar,
                                            alt_text: first_name,
                                        },
                                    }),
                                },
                                {
                                    type: 'section',
                                    text: {
                                        type: 'mrkdwn',
                                        text: `<https://squeak.cloud/question/${messageId}|View question>`,
                                    },
                                },
                            ],
                        }),
                    })
            }
        })
    )
}

export default sendQuestionAlert
