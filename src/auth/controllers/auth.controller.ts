import { Controller, Post, Version, Body, ValidationPipe, UseGuards, Req, HttpCode, Delete } from '@nestjs/common'
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { ApiErrorResponse } from '@core/decorators/swagger.decorator'
import { AUTH_ERRORS, USERS_ERRORS } from '@core/errors/error.list'
import { ExceptionHandler } from '@core/errors/error.handler'
import { DataResponse } from '@core/decorators/response/data-response.decorator'

import { JwtAuthGuard } from '../guards/jwt.access.guard'
import { AuthService } from '../services/auth.service'
import { AccessTokenResponse, AuthInfoRequest, RefreshTokenRequest, TokenResponse } from '../dto/jwt.dto'
import { BaseResponse } from '@core/dto/base-response.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Version('1')
    @ApiOperation({ summary: 'JWT Login' })
    @DataResponse(TokenResponse, 'Login Success')
    @ApiErrorResponse(400, [USERS_ERRORS.NOT_EXIST_USER])
    @HttpCode(200)
    @Post('sign-in')
    async signIn(@Body(ValidationPipe) authInfoRequest: AuthInfoRequest): Promise<TokenResponse> {
        const user = await this.authService.validateUser(authInfoRequest)
        const tokenInfo = await this.authService.getJwtToken(user)
        const response = plainToInstance(TokenResponse, tokenInfo)
        console.log(`[Login] ${user.id} - ${user.profileName} Login Success`)
        return response
    }

    @Version('1')
    @ApiOperation({ summary: 'JWT Access Token Reissue' })
    @DataResponse(AccessTokenResponse, 'Token Reissue Success')
    @ApiErrorResponse(400, [USERS_ERRORS.NOT_EXIST_USER])
    @ApiErrorResponse(401, [AUTH_ERRORS.INVALID_REFRESH_TOKEN])
    @HttpCode(200)
    @Post('reissue')
    async reissue(@Body() refreshTokenRequest: RefreshTokenRequest): Promise<AccessTokenResponse> {
        try {
            const accessToken = await this.authService.reissueAccessToken(refreshTokenRequest)
            const response = plainToInstance(AccessTokenResponse, accessToken)
            return response
        } catch (err) {
            throw new ExceptionHandler(AUTH_ERRORS.INVALID_REFRESH_TOKEN)
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Version('1')
    @ApiOperation({ summary: 'Sign Out' })
    @DataResponse(BaseResponse, 'Logout Success')
    @Delete('sign-out')
    async logout(@Req() req: any): Promise<BaseResponse> {
        const user = req.user
        const result = await this.authService.removeRefreshToken(user)
        const response = plainToInstance(BaseResponse, result)
        return response
    }

    @Version('1')
    @ApiOperation({ summary: 'JWT Login (Redis Version)' })
    @DataResponse(TokenResponse, 'Redis Login Success')
    @ApiErrorResponse(400, [USERS_ERRORS.NOT_EXIST_USER])
    @HttpCode(200)
    @Post('redis-auth')
    async redisTest(@Body(ValidationPipe) authInfoRequest: AuthInfoRequest): Promise<TokenResponse> {
        const user = await this.authService.validateUser(authInfoRequest)
        const tokenInfo = await this.authService.getTokenWithRedis(user)
        const response = plainToInstance(TokenResponse, tokenInfo)
        console.log(`[Login] ${user.id} - ${user.profileName} Login Success`)
        return response
    }
}
