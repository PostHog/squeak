import xss from 'xss'

export default function formatSlackElements(elements, apiKey) {
    const types = {
        text: (el) => {
            return el.style?.code ? '`' + el.text + '`' : el.text
        },
        user: (el) => {
            return '**@Slack user**'
        },
        link: (el) => {
            return `[${el.text || el.url}](${el.url})`
        },
        emoji: (el) => {
            return ''
        },
        channel: (_el) => {
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
                const formatted = types[el2.type](el2)
                message.push(formatted)
            }
        }
    }
    return xss(message.join(''), {
        whiteList: {},
        stripIgnoreTag: true,
    })
}
