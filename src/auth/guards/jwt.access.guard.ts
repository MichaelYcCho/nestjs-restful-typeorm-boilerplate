import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from '@auth/services/auth.service'
import { ExceptionHandler } from '@core/errors/error.handler'
import { AUTH_ERRORS } from '@core/errors/error.list'

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private authService: AuthService,
        private readonly configService: ConfigService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<any> {
        try {
            const request = context.switchToHttp().getRequest()
            const authHeader = request.headers['authorization']

            // Authorization 헤더가 없는 경우
            if (!authHeader) {
                throw new ExceptionHandler(AUTH_ERRORS.MISSING_AUTHORIZATION_HEADER)
            }

            // Format: 'Bearer tokenValue'
            const tokenParts = authHeader.split(' ')
            if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
                throw new ExceptionHandler(AUTH_ERRORS.MISSING_JWT_TOKEN)
            }

            const token = tokenParts[1]
            if (!token) {
                throw new ExceptionHandler(AUTH_ERRORS.MISSING_JWT_TOKEN)
            }

            const tokenUser = await this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            })
            const userId = tokenUser?.id

            if (!userId) {
                throw new ExceptionHandler(AUTH_ERRORS.INVALID_ACCESS_TOKEN)
            }

            const user = await this.authService.getUserInfo(userId)
            if (user == null) {
                throw new ExceptionHandler(AUTH_ERRORS.FAILED_AUTHENTICATE)
            }
            request.user = user
            return true
        } catch (err) {
            console.error('[JwtAuthGuard] Error: ', err)

            // 이미 ExceptionHandler인 경우 그대로 던짐
            if (err instanceof ExceptionHandler) {
                throw err
            }

            // JWT 관련 에러 처리
            if (err.name === 'TokenExpiredError') {
                throw new ExceptionHandler(AUTH_ERRORS.EXPIRED_TOKEN)
            } else if (err.name === 'JsonWebTokenError') {
                throw new ExceptionHandler(AUTH_ERRORS.INVALID_SIGNATURE)
            }

            throw new ExceptionHandler(AUTH_ERRORS.FAILED_AUTHENTICATE)
        }
    }
}
