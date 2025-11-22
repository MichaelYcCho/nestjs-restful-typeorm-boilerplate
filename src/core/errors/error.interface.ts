export interface ErrorInterface {
    status?: number
    errorCode: string
    message: string
    target?: string | Record<string, unknown>
    timestamp?: string
}

export interface DynamicErrorOptions {
    customMessage?: string
    includeOriginalMessage?: boolean
}
