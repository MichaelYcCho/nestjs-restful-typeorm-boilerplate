import { Body, Controller, Post, Version } from '@nestjs/common'
import { UserService } from './users.service'
import { createUserRequest } from './dtos/create-user.dto'
import { plainToInstance } from 'class-transformer'
import { CoreResponse } from '@core/dtos/response.dto'

@Controller('users')
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Version('1')
    @Post()
    async createUser(@Body() data: createUserRequest) {
        const result = await this.usersService.createUser(data)
        const response = plainToInstance(CoreResponse, result)
        return response
    }
}
