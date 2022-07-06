class ApiResponseError extends Error {
    message: string
    response: Response

    constructor(message: string, response: Response) {
        super(message)
        this.message = message
        this.response = response
    }
}

// General api response interface
export interface ApiResponse<T = Record<string, unknown>> {
    response: Response // raw response object
    body: T // the decoded json body
}

// Replicates what is accepted by URLSearchParams constructor
type QueryParams = string | Record<string, string> | URLSearchParams | string[][]

interface RequestParams {
    body?: object // request body
    params?: QueryParams
}

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export async function doGet<ResponseType = Record<string, unknown>>(
    path: string,
    params?: QueryParams
): Promise<ApiResponse<ResponseType>> {
    const response = await performRequest(path, 'GET', { params })
    return generateApiResponse<ResponseType>(response)
}

export async function doPatch<ResponseType = Record<string, unknown>>(
    path: string,
    body?: object
): Promise<ApiResponse<ResponseType>> {
    const response = await performRequest(path, 'PATCH', { body })
    return generateApiResponse<ResponseType>(response)
}

export async function performRequest(path: string, method: RequestMethod, options?: RequestParams): Promise<Response> {
    const fetchArgs = {
        method,
        body: options?.body ? JSON.stringify(options.body) : undefined,
    }

    // append URL params if they exist
    if (options?.params) {
        path += '?' + new URLSearchParams(options.params).toString()
    }

    return fetch(path, fetchArgs)
}

/**
 * Handle an api response returned from `fetch`
 * If an error is returned we throw an `ApiResponseError`.
 * Otherwise, we return an `ApiResponse`, a thin wrapper around the parsed response body and the
 * raw response object.
 *
 * @param  {Response} response
 * @returns Promise<ApiResponse<ResponseType>>
 */
export async function generateApiResponse<ResponseType = Record<string, unknown>>(
    response: Response
): Promise<ApiResponse<ResponseType>> {
    const body = await response.json()

    if (!response.ok) {
        // we expect handled api errors to return an `error` property with a message
        const error = body.error
        throw new ApiResponseError(error, response)
    }

    return { body, response }
}
