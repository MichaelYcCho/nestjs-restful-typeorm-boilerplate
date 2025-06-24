import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class BaseResponse {
    @ApiProperty({
        example: 'error message',
        description: 'Error Message',
    })
    @IsString()
    message: string
}

export class BaseDataResponse<T> {
    @ApiProperty({ description: '응답 데이터' })
    data: T
}

export class BaseIdResponse {
    @ApiProperty({
        example: 'success',
        description: 'Success Message',
    })
    @IsString()
    message: string

    @ApiProperty({
        example: 1,
        description: 'Created Entity ID',
    })
    @IsNumber()
    id: number
}

export class BasePaginatedResponse<T> {
    @ApiProperty({
        example: 100,
        description: '전체 데이터 개수',
    })
    total: number

    @ApiProperty({
        example: 1,
        description: '현재 페이지 번호',
    })
    pageNumber: number

    @ApiProperty({
        example: 10,
        description: '페이지당 데이터 개수',
    })
    pageSize: number

    @ApiProperty({
        description: '페이지네이션된 데이터',
    })
    data: T
}
