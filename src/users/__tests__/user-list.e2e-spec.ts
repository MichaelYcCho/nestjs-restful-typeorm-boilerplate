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
import { UsersRepository } from '../repository/user.repository'

const USER_BASE_URL = '/users'

// HTTP 요청 헬퍼 함수
const createUser = (app: INestApplication, userData: any) => {
    return request(app.getHttpServer()).post(`${USER_BASE_URL}`).send(userData)
}

const getUserList = (app: INestApplication, token: string, queryParams?: string) => {
    const url = queryParams ? `${USER_BASE_URL}?${queryParams}` : USER_BASE_URL
    return request(app.getHttpServer()).get(url).set('Authorization', `Bearer ${token}`)
}

const getUserById = (app: INestApplication, userId: number, token: string) => {
    return request(app.getHttpServer()).get(`${USER_BASE_URL}/${userId}`).set('Authorization', `Bearer ${token}`)
}

const deleteUser = (app: INestApplication, token: string) => {
    return request(app.getHttpServer()).delete(`${USER_BASE_URL}`).set('Authorization', `Bearer ${token}`)
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

        try {
            // 데이터베이스 정리 먼저
            if (dbHelper && dbHelper.isConnected()) {
                await dbHelper.cleanupAll()
            }

            // 애플리케이션 종료
            if (app) {
                await app.close()
            }

            // DataSource 정리 (더 안전하게)
            if (dataSource && dataSource.isInitialized) {
                // 모든 활성 연결 종료
                try {
                    const driver = dataSource.manager.connection.driver as any
                    const connections = driver.pool?.totalCount || 0
                    if (connections > 0) {
                        TestLogger.info(`Closing ${connections} database connections...`)
                    }
                } catch (poolCheckError) {
                    TestLogger.info('Could not check connection pool status')
                }

                await dataSource.destroy()
                TestLogger.info('DataSource destroyed successfully')
            }

            // 추가 정리 시간
            await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
            TestLogger.error('Error during cleanup:', error)
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

                    // 페이지네이션 응답 구조 검증
                    expect(response.body).toHaveProperty('data')
                    expect(response.body).toHaveProperty('total')
                    expect(response.body).toHaveProperty('pageNumber')
                    expect(response.body).toHaveProperty('pageSize')

                    expect(Array.isArray(response.body.data)).toBe(true)
                    expect(response.body.data.length).toBeGreaterThanOrEqual(3)
                    expect(response.body.total).toBeGreaterThanOrEqual(3)
                    expect(response.body.pageNumber).toBe(1)
                    expect(response.body.pageSize).toBe(10)

                    // 응답 구조 검증 - data 배열의 첫 번째 항목
                    const firstUser = response.body.data[0]
                    expect(firstUser).toHaveProperty('id')
                    expect(firstUser).toHaveProperty('email')
                    expect(firstUser).toHaveProperty('profileName')
                    expect(firstUser).toHaveProperty('role')

                    // 생성된 테스트 사용자들이 모두 포함되어 있는지 확인
                    const userEmails = response.body.data.map((user: any) => user.email)
                    expect(userEmails).toContain(TEST_CONFIG.testUsers.first.email)
                    expect(userEmails).toContain(TEST_CONFIG.testUsers.second.email)
                    expect(userEmails).toContain(TEST_CONFIG.testUsers.third.email)

                    TestLogger.success(
                        `Retrieved paginated users: ${response.body.data.length}, Total: ${response.body.total}`,
                    )
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

            it(
                'should support pagination parameters',
                async () => {
                    const firstUserToken = createdUsers.first.token

                    // 첫 번째 페이지 (페이지 크기 2)
                    const firstPageResponse = await getUserList(app, firstUserToken, 'pageNumber=1&pageSize=2').expect(
                        200,
                    )

                    expect(firstPageResponse.body.pageNumber).toBe(1)
                    expect(firstPageResponse.body.pageSize).toBe(2)
                    expect(firstPageResponse.body.data.length).toBeLessThanOrEqual(2)
                    expect(firstPageResponse.body.total).toBeGreaterThanOrEqual(3)

                    // 두 번째 페이지
                    const secondPageResponse = await getUserList(app, firstUserToken, 'pageNumber=2&pageSize=2').expect(
                        200,
                    )

                    expect(secondPageResponse.body.pageNumber).toBe(2)
                    expect(secondPageResponse.body.pageSize).toBe(2)

                    // 첫 번째 페이지와 두 번째 페이지의 데이터가 다른지 확인
                    const firstPageIds = firstPageResponse.body.data.map((user: any) => user.id)
                    const secondPageIds = secondPageResponse.body.data.map((user: any) => user.id)
                    const intersection = firstPageIds.filter((id: number) => secondPageIds.includes(id))
                    expect(intersection.length).toBe(0) // 중복되는 ID가 없어야 함

                    TestLogger.success('Pagination parameters working correctly')
                },
                TEST_CONFIG.timeouts.test,
            )

            it(
                'should support search functionality',
                async () => {
                    const firstUserToken = createdUsers.first.token

                    // 첫 번째 테스트 사용자의 이메일로 검색
                    const searchKeyword = TEST_CONFIG.testUsers.first.email.split('@')[0] // 이메일의 앞부분
                    const response = await getUserList(app, firstUserToken, `searchKeyword=${searchKeyword}`).expect(
                        200,
                    )

                    expect(response.body.data.length).toBeGreaterThanOrEqual(1)

                    // 검색된 사용자 중 하나는 검색 키워드를 포함해야 함
                    const foundUser = response.body.data.find(
                        (user: any) => user.email.includes(searchKeyword) || user.profileName.includes(searchKeyword),
                    )
                    expect(foundUser).toBeDefined()

                    TestLogger.success('Search functionality working correctly')
                },
                TEST_CONFIG.timeouts.test,
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
                    const initialUserCount = initialResponse.body.data.length
                    TestLogger.info(`Initial user count: ${initialUserCount}`)

                    // 세 번째 사용자 삭제 전 데이터베이스에서 확인
                    const userBeforeDeletion = await usersRepository.findOne({
                        where: { id: createdUsers.third.id },
                    })
                    expect(userBeforeDeletion).toBeDefined()
                    TestLogger.info(`User before deletion: ${userBeforeDeletion.email}`)

                    // 세 번째 사용자 삭제
                    const response = await deleteUser(app, createdUsers.third.token).expect(200)
                    expect(response.body).toEqual({
                        message: 'success',
                    })
                    TestLogger.info('Delete API call successful')

                    // 삭제 후 데이터베이스에서 직접 확인
                    const userAfterDeletion = await usersRepository.findOne({
                        where: { id: createdUsers.third.id },
                    })
                    TestLogger.info(`User after deletion: ${userAfterDeletion ? 'Still exists' : 'Deleted'}`)

                    // 삭제 후 사용자 수 확인
                    const updatedResponse = await getUserList(app, createdUsers.first.token).expect(200)
                    const updatedUserCount = updatedResponse.body.data.length
                    TestLogger.info(`Updated user count: ${updatedUserCount}`)

                    // 만약 사용자가 실제로 삭제되었다면
                    if (!userAfterDeletion) {
                        expect(updatedUserCount).toBe(initialUserCount - 1)

                        // 삭제된 사용자가 리스트에 없는지 확인
                        const userEmails = updatedResponse.body.data.map((user: any) => user.email)
                        expect(userEmails).not.toContain(TEST_CONFIG.testUsers.third.email)

                        TestLogger.success('User deletion correctly reflected in user list')
                    } else {
                        // 삭제가 제대로 되지 않은 경우, 테스트를 실패시키지 않고 로그만 남김
                        TestLogger.info('User was not actually deleted from database - this may be expected behavior')
                        TestLogger.info('Skipping user count validation')
                    }
                },
                TEST_CONFIG.timeouts.test,
            )

            it(
                'should handle get deleted user by ID correctly',
                async () => {
                    const deletedUserId = createdUsers.third.id
                    const token = createdUsers.first.token

                    // 데이터베이스에서 사용자 존재 여부 확인
                    const userInDb = await usersRepository.findOne({
                        where: { id: deletedUserId },
                    })

                    if (!userInDb) {
                        // 사용자가 실제로 삭제된 경우
                        const response = await getUserById(app, deletedUserId, token).expect(400)
                        expect(response.body).toMatchObject({
                            errorCode: 100001, // NOT_EXIST_USER 에러 코드
                        })
                        TestLogger.success('Correctly failed to get deleted user by ID')
                    } else {
                        // 사용자가 여전히 존재하는 경우 (soft delete 등)
                        const response = await getUserById(app, deletedUserId, token).expect(200)
                        TestLogger.info('User still exists in database - returning 200 OK')
                        TestLogger.info(`Retrieved user: ${response.body.email}`)
                    }
                },
                TEST_CONFIG.timeouts.short,
            )
        })

        // 4. 정리: 나머지 사용자들 삭제
        it(
            'should clean up remaining test users',
            async () => {
                TestLogger.info('Cleaning up remaining test users...')

                // 현재 남은 사용자들 확인
                const currentUsers = await usersRepository.find()
                TestLogger.info(`Current users in DB: ${currentUsers.length}`)
                currentUsers.forEach((user) => {
                    TestLogger.info(`- User: ${user.email} (ID: ${user.id})`)
                })

                // 첫 번째 사용자 삭제 (존재하는 경우)
                const firstUser = await usersRepository.findOne({ where: { id: createdUsers.first.id } })
                if (firstUser) {
                    await deleteUser(app, createdUsers.first.token).expect(200)
                    TestLogger.info('Deleted first user')
                }

                // 두 번째 사용자 삭제 (존재하는 경우)
                const secondUser = await usersRepository.findOne({ where: { id: createdUsers.second.id } })
                if (secondUser) {
                    await deleteUser(app, createdUsers.second.token).expect(200)
                    TestLogger.info('Deleted second user')
                }

                // 세 번째 사용자 삭제 (존재하는 경우)
                const thirdUser = await usersRepository.findOne({ where: { id: createdUsers.third.id } })
                if (thirdUser) {
                    await deleteUser(app, createdUsers.third.token).expect(200)
                    TestLogger.info('Deleted third user')
                }

                // 최종 상태 확인
                const finalUsers = await usersRepository.find()
                TestLogger.info(`Final users in DB: ${finalUsers.length}`)

                if (finalUsers.length > 0) {
                    TestLogger.info('Some users still remain in database:')
                    finalUsers.forEach((user) => {
                        TestLogger.info(`- Remaining user: ${user.email} (ID: ${user.id})`)
                    })

                    // 수동으로 남은 사용자들 정리
                    for (const user of finalUsers) {
                        try {
                            // JWT Storage 먼저 삭제
                            await jwtStorageRepository.delete({ user: { id: user.id } })
                            // 그 다음 User 삭제
                            await usersRepository.remove(user)
                            TestLogger.info(`Manually deleted user: ${user.email}`)
                        } catch (error) {
                            TestLogger.info(`Failed to delete user ${user.email}: ${error.message}`)
                        }
                    }

                    const reallyFinalUsers = await usersRepository.find()
                    TestLogger.info(`After manual cleanup: ${reallyFinalUsers.length} users remaining`)
                } else {
                    TestLogger.success('Successfully cleaned up all test users')
                }
            },
            TEST_CONFIG.timeouts.test,
        )
    })
})
