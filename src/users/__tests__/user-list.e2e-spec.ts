import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { AppModule } from '../../app.module'
import { DataSource, Repository } from 'typeorm'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { TEST_CONFIG, createTestDataSource } from '../../../test/shared/test-config'
import { JwtStorage } from '../../auth/entities/jwt-storage.entity'
import { DatabaseTestHelper, TestLogger } from '../../../test/shared/utils/test-helpers'

const USER_BASE_URL = '/users'

// HTTP 요청 헬퍼 함수
const createUser = (app: INestApplication, userData: any) => {
    return request(app.getHttpServer()).post(`${USER_BASE_URL}/create`).send(userData)
}

const getUserList = (app: INestApplication, token: string) => {
    return request(app.getHttpServer()).get(`${USER_BASE_URL}`).set('Authorization', `Bearer ${token}`)
}

const getUserById = (app: INestApplication, userId: number, token: string) => {
    return request(app.getHttpServer()).get(`${USER_BASE_URL}/${userId}`).set('Authorization', `Bearer ${token}`)
}

const deleteUser = (app: INestApplication, token: string) => {
    return request(app.getHttpServer()).delete(`${USER_BASE_URL}/delete`).set('Authorization', `Bearer ${token}`)
}

describe('UsersController List APIs (e2e)', () => {
    let app: INestApplication
    let usersRepository: Repository<User>
    let jwtStorageRepository: Repository<JwtStorage>
    let dataSource: DataSource
    let jwtService: JwtService
    let configService: ConfigService
    let dbHelper: DatabaseTestHelper

    beforeAll(async () => {
        TestLogger.info('Setting up test environment...')

        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = module.createNestApplication()
        usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
        jwtStorageRepository = module.get<Repository<JwtStorage>>(getRepositoryToken(JwtStorage))
        jwtService = module.get<JwtService>(JwtService)
        configService = module.get<ConfigService>(ConfigService)

        // 최적화된 데이터베이스 연결
        dataSource = new DataSource(createTestDataSource())

        await dataSource.initialize()
        await app.init()

        // 데이터베이스 헬퍼 초기화
        dbHelper = new DatabaseTestHelper(dataSource, usersRepository, jwtStorageRepository)

        TestLogger.success('Test environment setup completed')
    }, TEST_CONFIG.timeouts.setup)

    afterAll(async () => {
        TestLogger.info('Cleaning up test environment...')

        if (dbHelper && dbHelper.isConnected()) {
            await dbHelper.cleanupAll()
        }

        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy()
        }

        if (app) {
            await app.close()
        }

        TestLogger.success('Test environment cleanup completed')
    }, TEST_CONFIG.timeouts.setup)

    describe('User List API Tests', () => {
        let createdUsers: { [key: string]: { id: number; token: string } } = {}

        beforeAll(async () => {
            // 각 describe 블록 시작 전에 데이터베이스 정리
            if (dbHelper && dbHelper.isConnected()) {
                await dbHelper.cleanupAll()
            }

            // 테스트 데이터 준비: 여러 사용자 생성
            TestLogger.info('Creating test users for all tests...')

            const userKeys = Object.keys(TEST_CONFIG.testUsers)

            for (const key of userKeys) {
                const userData = TEST_CONFIG.testUsers[key]
                const response = await createUser(app, userData).expect(201)

                expect(response.body).toEqual({
                    message: 'success',
                })

                // 생성된 사용자 정보 저장
                const createdUser = await usersRepository.findOne({
                    where: { email: userData.email },
                })
                expect(createdUser).toBeDefined()
                expect(createdUser.id).toBeDefined()

                // JWT 토큰 생성
                const token = jwtService.sign(
                    {
                        id: createdUser.id,
                        profileName: createdUser.profileName,
                    },
                    {
                        secret: configService.get<string>('JWT_ACCESS_SECRET'),
                    },
                )

                createdUsers[key] = {
                    id: createdUser.id,
                    token: token,
                }

                TestLogger.info(`Created user ${key} with ID: ${createdUser.id}`)
            }

            expect(Object.keys(createdUsers)).toHaveLength(3)
            TestLogger.success('All test users created successfully')
        }, TEST_CONFIG.timeouts.test)

        afterAll(async () => {
            // 각 describe 블록 종료 후 정리
            if (dbHelper && dbHelper.isConnected()) {
                await dbHelper.cleanupAll()
            }
        })

        // 1. getUserList API 테스트
        describe('GET /users - Get All Users', () => {
            it(
                'should get all users successfully',
                async () => {
                    const firstUserToken = createdUsers.first.token
                    const response = await getUserList(app, firstUserToken).expect(200)

                    expect(Array.isArray(response.body)).toBe(true)
                    expect(response.body.length).toBeGreaterThanOrEqual(3)

                    // 응답 구조 검증
                    const firstUser = response.body[0]
                    expect(firstUser).toHaveProperty('id')
                    expect(firstUser).toHaveProperty('email')
                    expect(firstUser).toHaveProperty('profileName')
                    expect(firstUser).toHaveProperty('role')
                    expect(firstUser).toHaveProperty('createdAt')
                    expect(firstUser).toHaveProperty('updatedAt')

                    // 생성된 테스트 사용자들이 모두 포함되어 있는지 확인
                    const userEmails = response.body.map((user: any) => user.email)
                    expect(userEmails).toContain(TEST_CONFIG.testUsers.first.email)
                    expect(userEmails).toContain(TEST_CONFIG.testUsers.second.email)
                    expect(userEmails).toContain(TEST_CONFIG.testUsers.third.email)

                    TestLogger.success(`Retrieved all users: ${response.body.length}`)
                },
                TEST_CONFIG.timeouts.test,
            )

            it(
                'should fail to get users without authentication',
                async () => {
                    const response = await request(app.getHttpServer()).get(`${USER_BASE_URL}`).expect(403)

                    expect(response.body).toHaveProperty('statusCode', 403)
                    expect(response.body).toHaveProperty('message', 'Forbidden resource')

                    TestLogger.success('Correctly failed without authentication')
                },
                TEST_CONFIG.timeouts.short,
            )

            it(
                'should fail to get users with invalid token',
                async () => {
                    const response = await request(app.getHttpServer())
                        .get(`${USER_BASE_URL}`)
                        .set('Authorization', 'Bearer invalid_token')
                        .expect(400)

                    expect(response.body).toHaveProperty('statusCode', 400)
                    expect(response.body).toHaveProperty('errorCode', 200005) // INVALID_SIGNATURE
                    expect(response.body).toHaveProperty('message', 'Invalid signature')

                    TestLogger.success('Correctly failed with invalid token')
                },
                TEST_CONFIG.timeouts.short,
            )
        })

        // 2. getUserById API 테스트
        describe('GET /users/:id - Get User By ID', () => {
            it(
                'should get user by valid ID successfully',
                async () => {
                    const userId = createdUsers.first.id
                    const token = createdUsers.first.token

                    const response = await getUserById(app, userId, token).expect(200)

                    expect(response.body).toMatchObject({
                        id: userId,
                        email: TEST_CONFIG.testUsers.first.email,
                        profileName: TEST_CONFIG.testUsers.first.profileName,
                    })

                    expect(response.body).toHaveProperty('role')
                    expect(response.body).toHaveProperty('createdAt')
                    expect(response.body).toHaveProperty('updatedAt')

                    TestLogger.success(`Retrieved user by ID: ${userId}`)
                },
                TEST_CONFIG.timeouts.test,
            )

            it(
                'should get different user by ID successfully',
                async () => {
                    const userId = createdUsers.second.id
                    const token = createdUsers.first.token // 다른 사용자의 토큰으로도 접근 가능

                    const response = await getUserById(app, userId, token).expect(200)

                    expect(response.body).toMatchObject({
                        id: userId,
                        email: TEST_CONFIG.testUsers.second.email,
                        profileName: TEST_CONFIG.testUsers.second.profileName,
                    })

                    TestLogger.success(`Retrieved different user by ID: ${userId}`)
                },
                TEST_CONFIG.timeouts.test,
            )

            it(
                'should fail to get user with non-existent ID',
                async () => {
                    const nonExistentId = 99999
                    const token = createdUsers.first.token

                    const response = await getUserById(app, nonExistentId, token).expect(400)

                    expect(response.body).toMatchObject({
                        errorCode: 100001, // NOT_EXIST_USER 에러 코드
                    })

                    TestLogger.success('Correctly failed to get non-existent user')
                },
                TEST_CONFIG.timeouts.short,
            )

            it(
                'should fail to get user with invalid ID format',
                async () => {
                    const invalidId = 'invalid_id'
                    const token = createdUsers.first.token

                    const response = await request(app.getHttpServer())
                        .get(`${USER_BASE_URL}/${invalidId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(500) // Invalid user ID 에러

                    TestLogger.success('Correctly failed with invalid ID format')
                },
                TEST_CONFIG.timeouts.short,
            )

            it(
                'should fail to get user without authentication',
                async () => {
                    const userId = createdUsers.first.id

                    const response = await request(app.getHttpServer()).get(`${USER_BASE_URL}/${userId}`).expect(403)

                    expect(response.body).toHaveProperty('statusCode', 403)
                    expect(response.body).toHaveProperty('message', 'Forbidden resource')

                    TestLogger.success('Correctly failed without authentication')
                },
                TEST_CONFIG.timeouts.short,
            )

            it(
                'should fail to get user with invalid token',
                async () => {
                    const userId = createdUsers.first.id

                    const response = await request(app.getHttpServer())
                        .get(`${USER_BASE_URL}/${userId}`)
                        .set('Authorization', 'Bearer invalid_token')
                        .expect(400)

                    expect(response.body).toHaveProperty('statusCode', 400)
                    expect(response.body).toHaveProperty('errorCode', 200005) // INVALID_SIGNATURE
                    expect(response.body).toHaveProperty('message', 'Invalid signature')

                    TestLogger.success('Correctly failed with invalid token')
                },
                TEST_CONFIG.timeouts.short,
            )
        })

        // 3. 통합 테스트: 사용자 삭제 후 리스트 확인
        describe('Integration Tests - User Deletion and List Updates', () => {
            it(
                'should reflect user deletion in user list',
                async () => {
                    // 초기 사용자 수 확인
                    const initialResponse = await getUserList(app, createdUsers.first.token).expect(200)
                    const initialUserCount = initialResponse.body.length

                    // 세 번째 사용자 삭제
                    const response = await deleteUser(app, createdUsers.third.token).expect(200)
                    expect(response.body).toEqual({
                        message: 'success',
                    })

                    // 삭제 후 사용자 수 확인
                    const updatedResponse = await getUserList(app, createdUsers.first.token).expect(200)
                    const updatedUserCount = updatedResponse.body.length

                    expect(updatedUserCount).toBe(initialUserCount - 1)

                    // 삭제된 사용자가 리스트에 없는지 확인
                    const userEmails = updatedResponse.body.map((user: any) => user.email)
                    expect(userEmails).not.toContain(TEST_CONFIG.testUsers.third.email)

                    TestLogger.success('User deletion correctly reflected in user list')
                },
                TEST_CONFIG.timeouts.test,
            )

            it(
                'should fail to get deleted user by ID',
                async () => {
                    const deletedUserId = createdUsers.third.id
                    const token = createdUsers.first.token

                    const response = await getUserById(app, deletedUserId, token).expect(400)

                    expect(response.body).toMatchObject({
                        errorCode: 100001, // NOT_EXIST_USER 에러 코드
                    })

                    TestLogger.success('Correctly failed to get deleted user by ID')
                },
                TEST_CONFIG.timeouts.short,
            )
        })

        // 4. 정리: 나머지 사용자들 삭제
        it(
            'should clean up remaining test users',
            async () => {
                TestLogger.info('Cleaning up remaining test users...')

                // 첫 번째 사용자 삭제
                await deleteUser(app, createdUsers.first.token).expect(200)

                // 두 번째 사용자 삭제
                await deleteUser(app, createdUsers.second.token).expect(200)

                // 최종 상태 확인
                const finalUsers = await usersRepository.find()
                expect(finalUsers).toHaveLength(0)

                TestLogger.success('Successfully cleaned up all test users')
            },
            TEST_CONFIG.timeouts.test,
        )
    })
})
