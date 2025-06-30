import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { UserRole } from '@core/utils/constant'
import { JwtStorageDto } from '@auth/dto/jwt-storage.dto'
import { Expose, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UserDto {
    @Expose()
    @ApiProperty({ description: 'ID', example: 1 })
    @IsNumber()
    id: number

    @Expose()
    @ApiProperty({ description: 'Email', example: 'test@test.com' })
    @IsEmail()
    email: string

    @Expose()
    @ApiProperty({ description: 'Password', example: '123456' })
    @IsString()
    password: string

    @Expose()
    @ApiProperty({ description: 'Profile Name', example: 'test' })
    @IsString()
    profileName: string

    @Expose()
    @ApiProperty({ description: 'Role', example: UserRole.ADMIN })
    @IsEnum(UserRole)
    role: UserRole

    @Expose()
    @ApiProperty({ description: 'Is Active', example: true })
    @IsBoolean()
    isActive: boolean

    @Expose()
    @ApiProperty({ description: 'JWT Storage' })
    jwtStorage: JwtStorageDto
}
