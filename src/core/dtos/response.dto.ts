import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'

export class BaseResponse {
    @ApiProperty({
        example: true,
        description: 'Is Success',
    })
    @IsBoolean()
    isSuccess: boolean

    @ApiProperty({
        example: 'error message',
        description: 'Error Message',
    })
    @IsString()
    message: string
}

export class ErrorResponse {
    @ApiProperty({ example: 400, description: 'HTTP Status Code' })
    status: number

    @ApiProperty({ example: 100005, description: 'Error Code' })
    errorCode: number

    @ApiProperty({ example: 'Invalid Request', description: 'Error Message' })
    errorMessage: string

    @ApiProperty({ example: '/api/v1/core', description: 'error path' })
    path: string

    @ApiProperty({ example: '2024-01-17T02:51:29.144Z', description: 'timestamp' })
    timestamp: string
}
