import { Module } from '@nestjs/common'
import { UserService } from './users.service'
import { UserController } from './users.controller'
import { UserRepository } from './user.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService, UserRepository],
    controllers: [UserController],
    exports: [UserRepository],
})
export class UsersModule {}
