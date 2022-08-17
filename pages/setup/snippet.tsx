import type { GetStaticPropsResult } from 'next'
import { ReactElement } from 'react'

import { NextPageWithLayout } from '../../@types/types'
import Button from '../../components/Button'
import CodeSnippet from '../../components/CodeSnippet'
import SetupLayout from '../../layout/SetupLayout'
import withPreflightCheck from '../../util/withPreflightCheck'
import getActiveOrganization from '../../util/getActiveOrganization'
import prisma from '../../lib/db'

interface Props {}

const Snippet: NextPageWithLayout<Props> = () => {
    return (
        <div>
            <main>
                <CodeSnippet />

                <hr className="mb-6" />

                <h3 className="mt-4">Setup complete</h3>
                <p>Now you can manage users and moderate content in the Squeak! admin portal.</p>

                <Button className="mt-4" href="/">
                    Go to Admin
                </Button>
            </main>
        </div>
    )
}

Snippet.getLayout = function getLayout(page: ReactElement) {
    return (
        <SetupLayout
            title="Install JS snippet"
            subtitle="Add this code snippet on the page(s) where you want Squeak! to appear. Squeak! only looks at path
    named - query parameters are ignored."
        >
            {page}
        </SetupLayout>
    )
}

export const getServerSideProps = withPreflightCheck({
    redirectTo: '/',
    authCheck: true,
    authRedirectTo: '/setup/administration',
    async getServerSideProps(context): Promise<GetStaticPropsResult<Props>> {
        const organizationId = getActiveOrganization(context)

        const config = await prisma.squeakConfig.findFirst({
            where: { organization_id: organizationId },
        })

        if (!config) {
            throw new Error("Can't find Squeak config")
        }

        await prisma.squeakConfig.update({
            where: { id: config.id },
            data: { preflight_complete: true },
        })

        return {
            props: {},
        }
    },
})

export default Snippet
