import { HttpException, HttpStatus } from '@nestjs/common'
import { ErrorInterface, DynamicErrorOptions } from './error.interface'

export class ExceptionHandler extends HttpException {
    constructor(error: ErrorInterface | Error, options?: DynamicErrorOptions, prefix?: string) {
        let finalMessage: string

        if (error instanceof Error) {
            // Case 1: Just error.message (when passing a regular Error object)
            finalMessage = error.message
        } else {
            // Cases 2 & 3: Handle ErrorInterface with optional custom message
            const originalMessage = error.message
            const customMessage = options?.customMessage
            const includeOriginal = options?.includeOriginalMessage ?? false

            if (customMessage) {
                if (includeOriginal) {
                    // Case 3: Custom message + original message
                    finalMessage = `${customMessage}: ${originalMessage}`
                } else {
                    // Case 2: Only custom message
                    finalMessage = customMessage
                }
            } else {
                // Case 1: Only original message from ErrorInterface
                finalMessage = originalMessage
            }
        }

        const response = {
            statusCode: error instanceof Error ? HttpStatus.BAD_REQUEST : (error.status || HttpStatus.BAD_REQUEST),
            errorCode: error instanceof Error ? 999999 : (error.errorCode || 999999),
            message: finalMessage,
            target: error instanceof Error ? undefined : error.target,
            timestamp: new Date().toISOString(),
        }

        super(response, response.statusCode)

        console.log(prefix, response)
    }
}
