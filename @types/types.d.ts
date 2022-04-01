import type { NextPage } from 'next'
import type { ReactElement, ReactNode } from 'react'

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
}

type WebhookValues = {
    id: number
    url: string
    type: string
}
