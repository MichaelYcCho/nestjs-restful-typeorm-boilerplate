import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { AppModule } from 'src/app.module'
import { DataSource, Repository } from 'typeorm'
import request from 'supertest'
import { JwtStorage } from '@auth/entities/jwt-storage.entity'
import { bcryptHashing } from '@core/utils/hashing'

const AUTH_BASE_URL = '/auth'

const userRequest = {
    email: 'michael@gmail.com',
    password: '1234',
    profileName: 'Michael',
}

describe('UsersController (e2e)', () => {
    let app: INestApplication
    let userRepository: Repository<User>
    let jwtStorageRepository: Repository<JwtStorage>
    let jwtStorage: JwtStorage
    let user: User

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = module.createNestApplication()
        // getRepositoryToken(User)는 User entity의 repository를 가져온다.
        userRepository = module.get<Repository<User>>(getRepositoryToken(User))
        jwtStorageRepository = module.get<Repository<JwtStorage>>(getRepositoryToken(JwtStorage))
        await app.init()

        const hashedPassword = await bcryptHashing('1234', 12)

        // 테스트용 사용자 생성
        user = await userRepository.save({
            email: 'michael@gmail.com',
            password: hashedPassword,
            profileName: 'Michael',
        })
        await jwtStorageRepository.save({
            user,
        })
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

    describe('Auth API', () => {
        it('should login user', async () => {
            const response = await request(app.getHttpServer())
                .post(`${AUTH_BASE_URL}/sign-in`)
                .send({ email: userRequest.email, password: userRequest.password })
                .expect(200)

            //check accessToken is not null
            expect(response.body.accessToken).toBeTruthy()
            expect(response.body.refreshToken).toBeTruthy()

            // 데이터베이스에서 사용자 정보 조회
            const user = await userRepository.findOne({ where: { email: userRequest.email } })

            // 응답 본문의 사용자 정보와 비교
            expect(response.body.user.id).toEqual(user.id)
        })
    })
})
