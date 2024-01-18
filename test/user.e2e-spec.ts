import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { AppModule } from 'src/app.module'
import { DataSource, Repository } from 'typeorm'
import request from 'supertest'

const USER_BASE_URL = '/users'

describe('UsersController (e2e)', () => {
    let app: INestApplication
    let userRepository: Repository<User>
    let user: User

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = module.createNestApplication()
        // getRepositoryToken(User)는 User entity의 repository를 가져온다.
        userRepository = module.get<Repository<User>>(getRepositoryToken(User))
        await app.init()
    })

    afterAll(async () => {
        const dataSource: DataSource = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        })
        const connection: DataSource = await dataSource.initialize()
        await connection.dropDatabase() // 데이터베이스 삭제
        await connection.destroy() // 연결 해제
        await app.close()
    })

    describe('User API', () => {
        const createUserRequest = {
            email: 'michael@gmail.com',
            password: '1234',
            profileName: 'Michael',
        }

        it('should create user', async () => {
            const response = await request(app.getHttpServer()).post(USER_BASE_URL).send(createUserRequest).expect(201)

            expect(response.body).toEqual({
                isSuccess: true,
                message: null,
            })
        })

        it('should fail if user email already exist', async () => {
            const response = await request(app.getHttpServer()).post(USER_BASE_URL).send(createUserRequest).expect(400)

            expect(response.status).toBe(400)

            // 에러 응답의 본문을 검증합니다.
            expect(response.body).toMatchObject({
                errorCode: 100002,
            })
        })
    })
})
