export * from './cookies'
export * from './session'

export type OAuthState = {
    organizationId?: string
    redirect?: string
    action?: 'signup' | 'login'
}
