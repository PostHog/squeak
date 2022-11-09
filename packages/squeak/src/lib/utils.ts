export const classNames = (...args: (string | null | undefined)[]) => {
    return args.filter(Boolean).join(' ')
}
