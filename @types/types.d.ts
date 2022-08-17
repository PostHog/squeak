import type { NextPage } from 'next'
import type { ReactElement, ReactNode } from 'react'
import { ID } from '../lib/types'

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
}

type WebhookValues = {
    id: ID
    url: string
    type: string
}
