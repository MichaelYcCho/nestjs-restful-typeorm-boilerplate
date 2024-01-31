import * as bcrypt from 'bcrypt'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { ExceptionHandler } from '@core/errors/error.handler'
import { AUTH_ERRORS, USERS_ERRORS } from '@core/errors/error.list'
import { bcryptHashing } from '@core/utils/hashing'
import { User } from '@users/entities/user.entity'

import { JwtStorageRepository } from '@auth/repository/auth.repository'
import { TokenPayload } from '@auth/auth_type'
import { UserRepository } from '@users/repository/user.repository'
import { AccessTokenResponse, RefreshTokenRequest, TokenResponse } from '@auth/dtos/jwt.dto'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(JwtStorageRepository)
        private jwtStorageRepository: JwtStorageRepository,
        private readonly configService: ConfigService,
        private jwtService: JwtService,
        private userRepository: UserRepository,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async validateUser({ email, password }): Promise<any> {
        const user = await this.userRepository.getUserByEmailWithPwd(email)
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user // eslint-disable-line
            return result
        } else {
            throw new ExceptionHandler(AUTH_ERRORS.FAILED_AUTHENTICATE)
        }
    }

    async getJwtToken(user: User): Promise<TokenResponse> {
        /*
            Comments: 
                Create access token & refresh token.
        */

        const accessToken = await this.createAccessToken(user)
        const refreshToken = await this.createRefreshToken(user)
        await this.updateRefreshToken(user, refreshToken)
        const tokenInfo = { accessToken, refreshToken, user }
        return tokenInfo
    }

    async createAccessToken(user: User): Promise<string> {
        /*
            Comments: 
                Create access token.
        */
        const payload: TokenPayload = {
            id: user.id,
            profileName: user.profileName,
        }
        const accessToken = this.jwtService.sign(payload)
        return accessToken
    }

    async createRefreshToken(user: User): Promise<string> {
        /*
            Comments: 
                Create refresh token.
        */
        const payload: TokenPayload = {
            id: user.id,
            profileName: user.profileName,
        }
        const refreshToken = this.jwtService.sign(
            { id: payload.id },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
            },
        )
        return refreshToken
    }

    async updateRefreshToken(user: User, refreshToken: any): Promise<void> {
        /*
            Comments: 
                user refreshToken update it.
        */
        const jwtStorage = await this.jwtStorageRepository.findJwtStorageByUserId(user.id)

        if (jwtStorage == null) {
            throw new ExceptionHandler(AUTH_ERRORS.NOT_EXIST_JWT_STORAGE)
        }

        const verifiedToken = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        })
        const refreshExpiredAt = verifiedToken.exp
        const hashingToken = await bcryptHashing(refreshToken, 10)

        await this.jwtStorageRepository.update(jwtStorage.id, {
            refreshToken: hashingToken,
            refreshTokenExpiredAt: refreshExpiredAt,
        })
    }

    async reissueAccessToken(refreshTokenDto: RefreshTokenRequest): Promise<AccessTokenResponse> {
        /*
            Comments: 
                Reissue access token from refresh token.
        */
        const { refreshToken } = refreshTokenDto
        const decodedRefreshToken = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        }) as TokenPayload

        const userId = decodedRefreshToken.id
        const user = await this.getUserFromRefreshToken(refreshToken, userId)
        if (!user) {
            throw new ExceptionHandler(USERS_ERRORS.NOT_EXIST_USER)
        }

        const accessToken = await this.createAccessToken(user)
        return { accessToken }
    }

    async getUserFromRefreshToken(refreshToken: string, userId: number): Promise<User> {
        /*
            Comments: 
                Check if the refresh token is valid.
                if refresh token is None, return null.
        */

        const user: User = await this.userRepository.getUserByIdWithJwtInfo(userId)

        if (user.jwtStorage.refreshToken == null) {
            return null
        }

        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.jwtStorage.refreshToken)
        if (isRefreshTokenMatching) {
            return user
        }
    }

    async removeRefreshToken(user: User): Promise<any> {
        /*
            Comments: 
                Remove refresh token.
        */
        const jwtStorage = await this.jwtStorageRepository.findJwtStorageByUserId(user.id)

        if (!jwtStorage) {
            throw new ExceptionHandler(AUTH_ERRORS.NOT_EXIST_JWT_STORAGE)
        }

        await this.jwtStorageRepository.update(user.id, {
            refreshToken: null,
            refreshTokenExpiredAt: null,
        })
        return { isSuccess: true, message: null }
    }

    async getUserInfo(userId: number): Promise<User> {
        return await this.userRepository.getUserById(userId)
    }

    async getTokenWithRedis(user: User): Promise<TokenResponse> {
        const accessToken = await this.createAccessToken(user)
        const refreshToken = await this.createRefreshToken(user)
        await this.updateRefreshToken(user, refreshToken)
        const tokenInfo = { accessToken, refreshToken, user }
        await this.cacheManager.set('tokenInfo', tokenInfo)
        const cacheTokenInfo = await this.cacheManager.get('tokenInfo')
        // await this.cacheManager.del('tokenInfo')
        // await this.cacheManager.reset()
        console.log(cacheTokenInfo)
        return tokenInfo
    }
}
