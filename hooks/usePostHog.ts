import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import posthog from 'posthog-js'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import useActiveOrganization from './useActiveOrganization'

const usePostHog = () => {
    const router = useRouter()
    const { getActiveOrganization } = useActiveOrganization()
    const { user } = useUser()
    const organizationId = getActiveOrganization()

    const initPostHog = useCallback(() => {
        if ('false' === process.env.NEXT_PUBLIC_OPT_OUT_TRACKING && process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
                persistence: 'localStorage+cookie',
                capture_pageview: false,
                loaded: function (ph) {
                    if (user) {
                        ph.identify(user.id)
                    }

                    if (organizationId) {
                        ph.group('organizations', `id:${organizationId}`)
                    }
                },
            })
        } else {
            posthog.init('fake token', {
                autocapture: false,
                loaded: function (ph) {
                    ph.opt_out_capturing()
                },
            })
        }
    }, [organizationId, user])

    const capturePageView = () => posthog?.capture('$pageview')

    useEffect(() => {
        initPostHog()

        // `routeChangeComplete` won't run for the first page load unless the query string is
        // hydrated later on, so here we log a page view if this is the first render and
        // there's no query string
        if (!router.asPath.includes('?')) {
            capturePageView()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        router.events.on('routeChangeComplete', capturePageView)

        return () => {
            router.events.off('routeChangeComplete', capturePageView)
        }
    }, [router.events])
}

export default usePostHog
