import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

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
        example: 1,
        description: 'User Role',
    })
    @IsNumber()
    role: number
}
