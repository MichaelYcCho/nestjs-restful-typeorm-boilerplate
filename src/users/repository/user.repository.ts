import { Injectable } from '@nestjs/common'
import { User } from '@users/entities/user.entity'
import { DataSource, Repository } from 'typeorm'
import { JwtStorage } from '@auth/entities/jwt-storage.entity'
import { USERS_ERRORS } from '@core/errors/error.list'
import { ExceptionHandler } from '@core/errors/error.handler'
import { FilterUsersDto } from '@users/dto/filter-dto'

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

    async getUserList(filterDto: FilterUsersDto) {
        const { pageNumber, pageSize, searchKeyword, role, isActive } = filterDto

        const whereClause: any = {}

        if (role !== undefined) {
            whereClause.role = role
        }

        if (isActive !== undefined) {
            whereClause.isActive = isActive
        }

        let queryBuilder = this.createQueryBuilder('users')
            .select([
                'users.id',
                'users.email',
                'users.profileName',
                'users.role',
                'users.isActive',
                'users.createdAt',
                'users.updatedAt',
            ])
            .skip(((Number(pageNumber) || 1) - 1) * (Number(pageSize) || 10))
            .take(Number(pageSize) || 10)
            .orderBy('users.createdAt', 'DESC')
            .addOrderBy('users.id', 'DESC')

        if (Object.keys(whereClause).length > 0) {
            queryBuilder = queryBuilder.where(whereClause)
        }

        if (searchKeyword) {
            if (Object.keys(whereClause).length > 0) {
                queryBuilder = queryBuilder.andWhere(
                    '(users.email ILIKE :searchKeyword OR users.profileName ILIKE :searchKeyword)',
                    {
                        searchKeyword: `%${searchKeyword}%`,
                    },
                )
            } else {
                queryBuilder = queryBuilder.where(
                    '(users.email ILIKE :searchKeyword OR users.profileName ILIKE :searchKeyword)',
                    {
                        searchKeyword: `%${searchKeyword}%`,
                    },
                )
            }
        }

        const [users, count] = await queryBuilder.getManyAndCount()

        return { users, count }
    }

    async getUserByIdForDetail(userId: number): Promise<User | null> {
        return this.findOne({
            where: { id: userId },
            select: ['id', 'email', 'profileName', 'role', 'createdAt', 'updatedAt'],
        })
    }

    async deleteUserWithJwtStorage(user: User): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            // JWT Storage 먼저 삭제 (외래키 제약조건 때문에)
            await queryRunner.manager.delete(JwtStorage, { user: { id: user.id } })
            // 그 다음 User 삭제
            await queryRunner.manager.remove(User, user)
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
