import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNumber, IsString } from 'class-validator'

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

export class updateUserRequest {
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

export class UserResponse {
    @ApiProperty({
        example: 1,
        description: 'User Id',
    })
    @IsNumber()
    id: number

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
        example: 1,
        description: 'User Role',
    })
    @IsNumber()
    role: number
}
