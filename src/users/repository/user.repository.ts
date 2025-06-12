import { Injectable } from '@nestjs/common'
import { User } from '@users/entities/user.entity'
import { DataSource, Repository } from 'typeorm'
import { JwtStorage } from '@auth/entities/jwt-storage.entity'
import { USERS_ERRORS } from '@core/errors/error.list'
import { ExceptionHandler } from '@core/errors/error.handler'

@Injectable()
export class UsersRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager())
    }

    async getUserById(userId: number) {
        return this.findOne({ where: { id: userId } })
    }

    async getUserByEmail(email: string) {
        return this.findOne({ where: { email } })
    }

    async getUserByEmailWithPwd(email: string) {
        return this.findOne({
            where: { email },
            select: ['id', 'email', 'profileName', 'password'],
        })
    }

    async getUserByProfileName(profileName: string) {
        return this.findOne({ where: { profileName } })
    }

    async getUserByIdWithJwtInfo(userId: number) {
        return this.findOne({
            where: { id: userId },
            relations: {
                jwtStorage: true,
            },
        })
    }

    async deleteUserWithJwtStorage(user: User): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            await this.remove(user)
            await queryRunner.manager.delete(JwtStorage, { user })
            await queryRunner.commitTransaction()
        } catch (e) {
            await queryRunner.rollbackTransaction()
            if (e instanceof ExceptionHandler) {
                throw e
            } else {
                console.error(`[DeleteUser] Error: ${e.message}`)
                throw new ExceptionHandler(USERS_ERRORS.FAILED_DELETE_USER)
            }
        } finally {
            await queryRunner.release()
        }
    }
}
