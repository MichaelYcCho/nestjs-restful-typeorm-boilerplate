import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { USERS_ERRORS } from '@core/errors/error.list'
import { bcryptHashing } from '@core/utils/hashing'
import { UserRepository } from './user.repository'
import { createUserRequest, updateUserRequest } from './dtos/user.dto'
import { ExceptionHandler } from '@core/errors/error.handler'
import { BaseResponse } from '@core/dtos/response.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) {}

    async createUser({ email, password, profileName }: createUserRequest): Promise<BaseResponse> {
        try {
            const existUser = await this.userRepository.getUserByEmail(email)
            if (existUser) {
                throw new ExceptionHandler(USERS_ERRORS.USER_EMAIL_ALREADY_EXIST)
            }
            const hashedPassword = await bcryptHashing(password, 12)
            await this.userRepository.save({
                email,
                password: hashedPassword,
                profileName,
            })
            return { isSuccess: true, message: null }
        } catch (e) {
            if (e instanceof ExceptionHandler) {
                throw e
            } else {
                console.error(`[CreateUser] Error: ${e.message}`)
                throw new ExceptionHandler(USERS_ERRORS.FAILED_CREATE_USER)
            }
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
