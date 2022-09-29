export default function dayFormat(days: number) {
    return days <= 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`
}
