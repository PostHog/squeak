import { useRef } from 'react'
import root from 'react-shadow/styled-components'

import { Provider as OrgProvider } from '../../context/org'
import { Provider as UserProvider } from '../../context/user'
import Questions from '../Questions'
import { Theme } from '../Theme'

type SqueakProps = {
    apiHost: string
    organizationId: string
    slug?: string
    limit?: number
    onSubmit: () => void
    onLoad: () => void
    topics?: boolean
    onSignUp: () => void
    topic?: any
    profileLink?: (profile: any) => string
}

export const Squeak = ({
    apiHost,
    organizationId,
    slug,
    limit,
    onSubmit,
    onLoad,
    topics = true,
    onSignUp,
    topic,
    profileLink,
}: SqueakProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <>
            {/* @ts-ignore */}
            <root.div ref={containerRef}>
                <OrgProvider value={{ organizationId, apiHost, profileLink }}>
                    <UserProvider>
                        <Theme containerRef={containerRef} />
                        <div className="squeak">
                            <Questions
                                onSignUp={onSignUp}
                                onLoad={onLoad}
                                topics={topics}
                                onSubmit={onSubmit}
                                limit={limit}
                                slug={slug}
                                topic={topic}
                            />
                        </div>
                    </UserProvider>
                </OrgProvider>
            </root.div>
        </>
    )
}
