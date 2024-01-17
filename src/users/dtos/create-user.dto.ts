import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class createUserRequest {
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
