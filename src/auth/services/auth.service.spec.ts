import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { JwtStorageRepository } from '@auth/repository/auth.repository'
import { UserRepository } from '@users/repository/user.repository'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

const mockJwtStorageRepository = () => ({
    findOne: jest.fn(),
})

const mockUserRepository = () => ({
    getUserByEmailWithPwd: jest.fn(),
})

const mockConfigService = {
    get: jest.fn(),
}

const mockJwtService = {
    sign: jest.fn(),
}

const mockCacheManager = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
}

describe('AuthService', () => {
    let authService: AuthService

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [],
            providers: [
                AuthService,
                {
                    provide: JwtStorageRepository,
                    useFactory: mockJwtStorageRepository,
                },
                {
                    provide: UserRepository,
                    useFactory: mockUserRepository,
                },

                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService, // ConfigService 모의 구현 추가
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService, // JwtService 모의 구현 추가
                },
            ],
        }).compile()

        authService = moduleRef.get<AuthService>(AuthService)
    })

    it('should be defined', () => {
        expect(authService).toBeDefined()
    })
})
