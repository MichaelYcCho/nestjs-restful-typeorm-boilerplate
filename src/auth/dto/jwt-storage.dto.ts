import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNumber, IsString } from 'class-validator'

export class JwtStorageDto {
    @Expose()
    @ApiProperty({ description: 'ID', example: 1 })
    @IsNumber()
    id: number

    @Expose()
    @ApiProperty({ description: 'Refresh Token', example: '123456' })
    @IsString()
    refreshToken: string

    @Expose()
    @ApiProperty({ description: 'Refresh Token Expired At', example: 1719859200 })
    @IsNumber()
    refreshTokenExpiredAt: number
}
