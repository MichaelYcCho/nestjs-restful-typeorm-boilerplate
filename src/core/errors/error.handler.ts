import { HttpException, HttpStatus } from '@nestjs/common'
import { ErrorInterface } from './error.interface'

export class ExceptionHandler extends HttpException {
    constructor(error: ErrorInterface, prefix?: string) {
        const response = {
            statusCode: error.status || HttpStatus.BAD_REQUEST,
            errorCode: error.errorCode || 999999,
            message: error.message,
            target: error.target,
            timestamp: new Date().toISOString(), // 타임스탬프 추가
        }

        super(response, error.status || HttpStatus.BAD_REQUEST)

        console.error(prefix, response) // 로깅 개선
    }
}
