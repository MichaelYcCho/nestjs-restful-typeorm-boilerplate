export interface ErrorInterface {
    status?: number
    errorCode: number
    message: string
    target?: any
    timestamp?: string
}

export interface DynamicErrorOptions {
    customMessage?: string
    includeOriginalMessage?: boolean
}
