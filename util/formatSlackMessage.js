export default async function formatSlackElements(elements, apiKey) {
    const types = {
        text: (el) => {
            return el.style?.code ? '`' + el.text + '`' : el.text
        },
        user: async (el) => {
            const user = await fetch(`https://slack.com/api/users.info?user=${el.user_id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
            }).then((res) => res.json())
            return user?.user?.profile?.first_name || user?.user?.name
        },
        link: (el) => {
            return `[${el.text || el.url}](${el.url})`
        },
        emoji: (el) => {
            return ''
        },
    }
    const message = []
    for (const el of elements) {
        if (el.type === 'rich_text_preformatted') {
            el.elements.forEach((el) => {
                message.push('```shell\n' + el.text + '\n```')
            })
        } else if (el.type === 'rich_text_list') {
            const { style } = el
            el.elements.forEach((el, index) => {
                message.push(`${style === 'ordered' ? index + 1 + '.' : '-'} ${el.elements[0].text}\n`)
            })
        } else {
            for (const el2 of el.elements) {
                const formatted = await types[el2.type](el2)
                message.push(formatted)
            }
        }
    }
    return message.join('')
}
