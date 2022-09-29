import { useRouter } from 'next/router'
import { useEffect } from 'react'
import posthog from 'posthog-js'

import useActiveOrganization from './useActiveOrganization'
import { useUser } from '../contexts/user'

const usePostHog = () => {
    const router = useRouter()
    const { getActiveOrganization } = useActiveOrganization()
    const { user, isLoading: userLoading } = useUser()
    const organizationId = getActiveOrganization()

    const capturePageView = () => posthog?.capture('$pageview')

    useEffect(() => {
        const trackingEnabled = !JSON.parse(process.env.NEXT_PUBLIC_OPT_OUT_TRACKING)

        if (trackingEnabled && process.env.NEXT_PUBLIC_POSTHOG_API_KEY && !userLoading) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
                persistence: 'localStorage+cookie',
                capture_pageview: false,
                loaded: function (ph) {
                    if (user && user.email) {
                        ph.identify(user.id)
                    }

                    if (organizationId) {
                        ph.group('organization', `id:${organizationId}`)
                    }

                    capturePageView()
                },
            })
        } else if (!trackingEnabled && !userLoading) {
            posthog.init('fake token', {
                autocapture: false,
                loaded: function (ph) {
                    ph.opt_out_capturing()
                },
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLoading])

    useEffect(() => {
        router.events.on('routeChangeComplete', capturePageView)

        return () => {
            router.events.off('routeChangeComplete', capturePageView)
        }
    }, [router.events])
}

export default usePostHog
