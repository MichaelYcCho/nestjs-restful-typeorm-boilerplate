import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNumber, IsString } from 'class-validator'

export class createUserDto {
    @ApiProperty({
        example: 'michael@abc.com',
        description: 'Email',
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: 'michael',
        description: 'Profile Name',
    })
    @IsString()
    profileName: string

    @ApiProperty({
        example: '1234',
        description: 'Password',
    })
    @IsString()
    password: string
}
