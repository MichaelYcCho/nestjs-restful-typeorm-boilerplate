import { IsBoolean, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator'
import { UserRole } from '@core/utils/constant'
import { JwtStorageDto } from '@auth/dto/jwt-storage.dto'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class UserDto {
    @Expose()
    @ApiProperty({ description: 'ID' })
    @IsNumber()
    id: number

    @Expose()
    @ApiProperty({ description: 'Email' })
    @IsEmail()
    email: string

    @Expose()
    @ApiProperty({ description: 'Password' })
    @IsString()
    password: string

    @Expose()
    @ApiProperty({ description: 'Profile Name' })
    @IsString()
    profileName: string

    @Expose()
    @ApiProperty({ description: 'Role' })
    @IsEnum(UserRole)
    role: UserRole

    @Expose()
    @ApiProperty({ description: 'Is Active' })
    @IsBoolean()
    isActive: boolean

    @Expose()
    @ApiProperty({ description: 'JWT Storage' })
    jwtStorage: JwtStorageDto
}
