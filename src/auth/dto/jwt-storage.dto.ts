import { IsNumber, IsString } from 'class-validator'

export class JwtStorageDto {
    @IsNumber()
    id: number

    @IsString()
    refreshToken: string

    @IsNumber()
    refreshTokenExpiredAt: number
}
