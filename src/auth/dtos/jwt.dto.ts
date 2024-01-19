import { UserResponse } from '@users/dtos/user.dto'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class AuthInfoRequest {
    @IsNotEmpty()
    @IsString()
    email: string

    @IsNotEmpty()
    @IsString()
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

    @Type(() => UserResponse)
    user: UserResponse
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
