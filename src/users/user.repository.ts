import { Injectable } from '@nestjs/common'
import { User } from '@users/entities/user.entity'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class UserRepository extends Repository<User> {
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
}
