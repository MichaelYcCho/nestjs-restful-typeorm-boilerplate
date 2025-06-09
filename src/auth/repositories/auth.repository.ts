import { JwtStorage } from '@auth/entities/jwt-storage.entity'
import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class JwtStorageRepository extends Repository<JwtStorage> {
    constructor(private dataSource: DataSource) {
        super(JwtStorage, dataSource.createEntityManager())
    }

    async findJwtStorageByUserId(userId: number) {
        return this.findOne({ where: { user: { id: userId } } })
    }
}
