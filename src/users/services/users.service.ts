import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { USERS_ERRORS } from '@core/errors/error.list'
import { bcryptHashing } from '@core/utils/hashing'
import { createUserRequest, updateUserRequest } from '../dtos/user.dto'
import { ExceptionHandler } from '@core/errors/error.handler'
import { BaseResponse } from '@core/dtos/response.dto'
import { DataSource, EntityManager } from 'typeorm'
import { UserRepository } from '../repository/user.repository'
import { User } from '../entities/user.entity'
import { JwtStorage } from '@auth/entities/jwt-storage.entity'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private entityManager: EntityManager,
        private dataSource: DataSource,
    ) {}

    async createUser({ email, password, profileName }: createUserRequest): Promise<BaseResponse> {
        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const existUser = await this.userRepository.getUserByEmail(email)
            if (existUser) {
                throw new ExceptionHandler(USERS_ERRORS.USER_EMAIL_ALREADY_EXIST)
            }
            const hashedPassword = await bcryptHashing(password, 12)
            const user = await this.userRepository.save({
                email,
                password: hashedPassword,
                profileName,
            })
            await queryRunner.manager.save(JwtStorage, {
                user,
            })
            await queryRunner.commitTransaction()
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

    async updateUser({ profileName, role }: updateUserRequest): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { profileName } })
            if (!user) {
                throw new ExceptionHandler(USERS_ERRORS.NOT_EXIST_USER)
            }
            user.profileName = profileName
            user.role = role
            await this.userRepository.save(user)
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
