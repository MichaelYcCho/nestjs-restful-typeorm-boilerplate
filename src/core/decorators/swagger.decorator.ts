import { ErrorResponse } from '@core/dtos/response.dto'
import { ApiResponse } from '@nestjs/swagger'

export const ApiErrorResponse = (status: number, errors: any[]): MethodDecorator => {
    const description = errors.map((error) => `errorCode: ${error.errorCode}, message: ${error.message}`).join('<br>')

    return ApiResponse({
        status: status,
        description: description,
        type: ErrorResponse,
    })
}
