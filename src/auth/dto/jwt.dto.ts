import { ApiProperty } from '@nestjs/swagger'
import { UserDto } from '@users/dto/user.dto'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class AuthInfoRequest {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Email', example: 'michael@abc.com' })
    email: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Password', example: '1234' })
    @Matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/, {
        message: 'password accepts alphanumeric or characters',
    })
    password: string
}

export class TokenResponse {
    @IsString()
    accessToken: string

    @IsString()
    refreshToken: string

    @Type(() => UserDto)
    user: UserDto
}

export class AccessTokenResponse {
    @IsNotEmpty()
    @IsString()
    accessToken: string
}

export class RefreshTokenRequest {
    @IsNotEmpty()
    @IsString()
    refreshToken: string
}
