import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { AppModule } from 'src/app.module'
import { DataSource, Repository } from 'typeorm'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UserRole } from '@core/utils/constant'

const USER_BASE_URL = '/users'

// 테스트 데이터
const TEST_USERS = {
    first: {
        email: 'michael@gmail.com',
        password: '1234',
        profileName: 'Michael',
    },
    second: {
        email: 'john@gmail.com',
        password: '5678',
        profileName: 'John',
    },
}

// HTTP 요청 헬퍼 함수
const createUser = (app: INestApplication, userData: any) => {
    return request(app.getHttpServer()).post(`${USER_BASE_URL}/create`).send(userData)
}

const updateUser = (app: INestApplication, userData: any, token: string) => {
    return request(app.getHttpServer())
        .patch(`${USER_BASE_URL}/update`)
        .set('Authorization', `Bearer ${token}`)
        .send(userData)
}

describe('UsersController (e2e) - Sequential Tests', () => {
    let app: INestApplication
    let usersRepository: Repository<User>
    let dataSource: DataSource
    let firstUserId: number
    let secondUserId: number
    let jwtService: JwtService
    let configService: ConfigService
    let authToken: string

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = module.createNestApplication()
        usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
        jwtService = module.get<JwtService>(JwtService)
        configService = module.get<ConfigService>(ConfigService)

        dataSource = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        })
        await dataSource.initialize()
        await app.init()
    })

    afterAll(async () => {
        await dataSource.dropDatabase()
        await dataSource.destroy()
        await app.close()
    })

    describe('Sequential User Operations', () => {
        // 첫 번째 테스트: 사용자 생성
        it('1. should create first user', async () => {
            const response = await createUser(app, TEST_USERS.first).expect(201)

            expect(response.body).toEqual({
                isSuccess: true,
                message: null,
            })

            // 생성된 사용자 ID 저장
            const createdUser = await usersRepository.findOne({
                where: { email: TEST_USERS.first.email },
            })
            expect(createdUser).toBeDefined()
            expect(createdUser.id).toBeDefined()

            firstUserId = createdUser.id
            // JWT 토큰 생성
            authToken = jwtService.sign(
                {
                    id: createdUser.id,
                    profileName: createdUser.profileName,
                },
                {
                    secret: configService.get<string>('JWT_ACCESS_SECRET'),
                },
            )
            console.log('First user created with ID:', firstUserId)
        })

        // 이메일 중복 체크 테스트
        it('should fail if user email already exists', async () => {
            const response = await createUser(app, TEST_USERS.first).expect(400)

            expect(response.body).toMatchObject({
                errorCode: 100002, // USER_EMAIL_ALREADY_EXIST 에러 코드
            })
        })

        // 두 번째 테스트: 첫 번째 사용자 정보 수정
        it('2. should update first user', async () => {
            console.log('Attempting to update user with ID:', firstUserId)
            expect(firstUserId).toBeDefined()

            const updateData = {
                userId: firstUserId,
                profileName: 'Michael Updated',
                role: UserRole.ADMIN,
            }

            const response = await updateUser(app, updateData, authToken).expect(200)

            expect(response.body).toMatchObject({
                profileName: updateData.profileName,
                role: updateData.role,
            })

            // 수정 확인
            const updatedUser = await usersRepository.findOne({
                where: { id: firstUserId },
            })
            expect(updatedUser.profileName).toBe(updateData.profileName)
            expect(updatedUser.role).toBe(updateData.role)
            console.log('First user successfully updated')
        })

        // 세 번째 테스트: 두 번째 사용자 생성
        it('3. should create second user', async () => {
            const response = await createUser(app, TEST_USERS.second).expect(201)

            expect(response.body).toEqual({
                isSuccess: true,
                message: null,
            })

            // 생성된 사용자 ID 저장
            const createdUser = await usersRepository.findOne({
                where: { email: TEST_USERS.second.email },
            })
            expect(createdUser).toBeDefined()
            expect(createdUser.id).toBeDefined()

            secondUserId = createdUser.id
            console.log('Second user created with ID:', secondUserId)
        })

        // 네 번째 테스트: 최종 상태 검증
        it('4. should verify final state', async () => {
            console.log('Verifying final state with IDs:', { firstUserId, secondUserId })

            // 첫 번째 사용자 확인
            const firstUser = await usersRepository.findOne({
                where: { id: firstUserId },
            })
            expect(firstUser).toBeDefined()
            expect(firstUser.profileName).toBe('Michael Updated')

            // 두 번째 사용자 확인
            const secondUser = await usersRepository.findOne({
                where: { id: secondUserId },
            })
            expect(secondUser).toBeDefined()
            expect(secondUser.email).toBe(TEST_USERS.second.email)

            // 최종적으로 데이터베이스에 두 명의 사용자가 존재해야 함
            const finalUsers = await usersRepository.find()
            expect(finalUsers).toHaveLength(2)
            console.log('Final state verification completed')
        })
    })
})
