import type {
    GetServerSidePropsContext,
    NextApiRequest,
    NextApiResponse,
    GetServerSideProps,
    NextApiHandler,
} from 'next'

type Args =
    | {
          getServerSideProps?: GetServerSideProps
      }
    | NextApiHandler

const withMultiTenantCheck = (arg: Args) => {
    if (typeof arg === 'function') {
        return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
            const isMultiTenancy = process.env.MULTI_TENANCY ?? false

            if (!isMultiTenancy) {
                res.status(404).json({
                    error: 'not_found',
                    description: 'The requested resource was not found',
                })
            }

            await arg(req, res)
        }
    } else {
        return async (context: GetServerSidePropsContext) => {
            try {
                const isMultiTenancy = process.env.MULTI_TENANCY ?? false

                if (!isMultiTenancy) {
                    return {
                        props: {
                            error: {
                                statusCode: 404,
                                message: 'The requested page is only available for multi-tenancy sites',
                            },
                        },
                    }
                }

                if (arg.getServerSideProps) {
                    return await arg.getServerSideProps(context)
                }

                return {
                    props: {},
                }
            } catch (error) {
                return {
                    props: {
                        error: {
                            statusCode: 404,
                            message: 'The requested page is only available for multi-tenancy sites',
                        },
                    },
                }
            }
        }
    }
}

export default withMultiTenantCheck
