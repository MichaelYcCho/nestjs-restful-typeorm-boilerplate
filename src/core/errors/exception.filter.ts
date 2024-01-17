import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

const DEFAULT_ERROR_CODE = 999999
const BAD_REQUEST = 400

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        console.error('[Exception]', exception)

        if (exception instanceof HttpException) {
            const status = exception.getStatus()
            const exceptionResponse = exception.getResponse()
            let errorMessage = 'An unexpected error occurred'
            let errorCode = DEFAULT_ERROR_CODE

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                errorMessage = (exceptionResponse as any).message || errorMessage
                errorCode = (exceptionResponse as any).errorCode || errorCode
            }

            console.error(`[Exception] ${errorMessage}`, exception.stack)
            this.sendErrorResponse(response, status, errorCode, errorMessage, request.url)
        } else {
            console.error(`[Exception] Unhandled exception`, exception instanceof Error ? exception.stack : '')
            this.sendErrorResponse(response, BAD_REQUEST, DEFAULT_ERROR_CODE, 'Unhandled exception', request.url)
        }
    }

    private sendErrorResponse(
        response: Response,
        status: number,
        errorCode: number,
        errorMessage: string,
        path: string,
    ) {
        response.status(status).json({
            status,
            errorCode,
            errorMessage,
            timestamp: new Date().toISOString(),
            path,
        })
    }
}
