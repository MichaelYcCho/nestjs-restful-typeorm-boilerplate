import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { USERS_ERRORS } from '@core/errors/error.list'
import { bcryptHashing } from '@core/utils/hashing'
import { plainToInstance } from 'class-transformer'

import { ExceptionHandler } from '@core/errors/error.handler'
import { BaseResponse } from '@core/dto/response.dto'
import { DataSource, EntityManager } from 'typeorm'

import { JwtStorage } from '@auth/entities/jwt-storage.entity'
import { LoggerHandler } from 'src/logger/logger.service'
import { updateUserDto } from '@users/dto/update-user.dto'
import { createUserDto } from '@users/dto/create-user.dto'
import { UsersRepository } from '@users/repository/user.repository'
import { UserDto } from '@users/dto/user.dto'
import { User } from '@users/entities/user.entity'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private entityManager: EntityManager,
        private dataSource: DataSource,
        private readonly logger: LoggerHandler,
    ) {}

    async createUser({ email, password, profileName }: createUserDto): Promise<BaseResponse> {
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

    async updateUser(user: UserDto, { profileName, role }: updateUserDto): Promise<UserDto> {
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

    async deleteUser(user: User): Promise<BaseResponse> {
        try {
            await this.usersRepository.deleteUserWithJwtStorage(user)
            this.logger.log(`[DeleteUser] Success: ${user.email}`)
            return { isSuccess: true, message: null }
        } catch (e) {
            if (e instanceof ExceptionHandler) {
                throw e
            } else {
                console.error(`[DeleteUser] Error: ${e.message}`)
                throw new ExceptionHandler(USERS_ERRORS.FAILED_DELETE_USER)
            }
        }
    }

    async getAllUsers(): Promise<UserDto[]> {
        try {
            const users = await this.usersRepository.getAllUsers()
            return users.map((user) => plainToInstance(UserDto, user))
        } catch (e) {
            console.error(`[GetAllUsers] Error: ${e.message}`)
            throw new ExceptionHandler(USERS_ERRORS.FAILED_GET_USER_PROFILE)
        }
    }

    async getUserById(userId: number): Promise<UserDto> {
        try {
            const user = await this.usersRepository.getUserByIdForDetail(userId)
            if (!user) {
                throw new ExceptionHandler(USERS_ERRORS.NOT_EXIST_USER)
            }
            return plainToInstance(UserDto, user)
        } catch (e) {
            if (e instanceof ExceptionHandler) {
                throw e
            } else {
                console.error(`[GetUserById] Error: ${e.message}`)
                throw new ExceptionHandler(USERS_ERRORS.FAILED_GET_USER_PROFILE)
            }
        }
    }
}
