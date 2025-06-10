import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { USERS_ERRORS } from '@core/errors/error.list'
import { bcryptHashing } from '@core/utils/hashing'
import { createUserRequest, updateUserRequest } from '../dto/user.dto'
import { ExceptionHandler } from '@core/errors/error.handler'
import { BaseResponse } from '@core/dto/response.dto'
import { DataSource, EntityManager } from 'typeorm'
import { UsersRepository } from '../repository/user.repository'
import { User } from '../entities/user.entity'
import { JwtStorage } from '@auth/entities/jwt-storage.entity'
import { LoggerHandler } from 'src/logger/logger.service'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private entityManager: EntityManager,
        private dataSource: DataSource,
        private readonly logger: LoggerHandler,
    ) {}

    async createUser({ email, password, profileName }: createUserRequest): Promise<BaseResponse> {
        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const existUser = await this.usersRepository.getUserByEmail(email)
            if (existUser) {
                throw new ExceptionHandler(USERS_ERRORS.USER_EMAIL_ALREADY_EXIST)
            }
            const hashedPassword = await bcryptHashing(password, 12)
            const user = await this.usersRepository.save({
                email,
                password: hashedPassword,
                profileName,
            })
            await queryRunner.manager.save(JwtStorage, {
                user,
            })
            await queryRunner.commitTransaction()
            this.logger.log(`[CreateUser] Success: ${user.email}`)
            return { isSuccess: true, message: null }
        } catch (e) {
            await queryRunner.rollbackTransaction()
            if (e instanceof ExceptionHandler) {
                throw e
            } else {
                console.error(`[CreateUser] Error: ${e.message}`)
                throw new ExceptionHandler(USERS_ERRORS.FAILED_CREATE_USER)
            }
        } finally {
            await queryRunner.release()
        }
    }

    async updateUser(user: User, { profileName, role }: updateUserRequest): Promise<User> {
        try {
            user.profileName = profileName
            user.role = role
            await this.usersRepository.save(user)
            return user
        } catch (e) {
            if (e instanceof ExceptionHandler) {
                throw e
            } else {
                console.error(`[UpdateUser] Error: ${e.message}`)
                throw new ExceptionHandler(USERS_ERRORS.FAILED_UPDATE_USER)
            }
        }
    }
}
