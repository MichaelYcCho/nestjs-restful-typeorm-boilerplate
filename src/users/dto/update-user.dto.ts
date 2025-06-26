import { UserRole } from '@core/utils/constant'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsString } from 'class-validator'

export class updateUserDto {
    @ApiProperty({
        example: 1,
        description: 'User ID',
    })
    @IsNumber()
    userId: number

    @ApiProperty({
        example: 'john',
        description: 'Profile Name',
    })
    @IsString()
    profileName: string

    @ApiProperty({
        example: UserRole.ADMIN,
        description: 'User Role',
        enum: UserRole,
    })
    @IsEnum(UserRole)
    role: UserRole
}
