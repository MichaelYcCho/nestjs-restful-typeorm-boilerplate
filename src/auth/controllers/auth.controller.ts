import { Controller, Post, Version, Body, ValidationPipe, UseGuards, Req, HttpCode, Delete } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { ApiErrorResponse } from '@core/decorators/swagger.decorator'
import { AUTH_ERRORS, USERS_ERRORS } from '@core/errors/error.list'
import { ExceptionHandler } from '@core/errors/error.handler'
import { BaseResponse } from '@core/dtos/response.dto'
import { JwtAuthGuard } from '../guards/jwt.access.guard'
import { AuthService } from '../services/auth.service'
import { AccessTokenResponse, AuthInfoRequest, RefreshTokenRequest, TokenResponse } from '../dtos/jwt.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiResponse({
        type: TokenResponse,
        status: 200,
        description: 'success',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.NOT_EXIST_USER])
    @Version('1')
    @ApiOperation({ summary: 'JWT Login' })
    @HttpCode(200)
    @Post('sign-in')
    async signIn(@Body(ValidationPipe) authInfoRequest: AuthInfoRequest): Promise<TokenResponse> {
        const user = await this.authService.validateUser(authInfoRequest)
        const tokenInfo = await this.authService.getJwtToken(user)
        const response = plainToInstance(TokenResponse, tokenInfo)
        console.log(`[Login] ${user.id} - ${user.profileName} Login Success`)
        return response
    }

    @ApiResponse({
        type: AccessTokenResponse,
        status: 200,
        description: 'success',
    })
    @Version('1')
    @ApiErrorResponse(400, [USERS_ERRORS.NOT_EXIST_USER])
    @ApiErrorResponse(401, [AUTH_ERRORS.INVALID_REFRESH_TOKEN])
    @ApiOperation({ summary: 'JWT Access Token Reissue, with Refresh Token' })
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
    @Version('1')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sign Out' })
    @ApiResponse({
        type: BaseResponse,
        status: 200,
        description: 'success',
    })
    @Delete('sign-out')
    async logout(@Req() req: any): Promise<BaseResponse> {
        const user = req.user
        const result = await this.authService.removeRefreshToken(user)
        const response = plainToInstance(BaseResponse, result)
        return response
    }

    @ApiResponse({
        type: TokenResponse,
        status: 200,
        description: 'success',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.NOT_EXIST_USER])
    @Version('1')
    @ApiOperation({ summary: 'JWT Login(Redis Ver)' })
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
