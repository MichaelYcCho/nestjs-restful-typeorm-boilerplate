import { Body, Controller, Post, Version } from '@nestjs/common'
import { UserService } from './users.service'
import { createUserRequest } from './dtos/create-user.dto'
import { plainToInstance } from 'class-transformer'
import { BaseResponse } from '@core/dtos/response.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { USERS_ERRORS } from '@core/errors/error.list'
import { ApiErrorResponse } from '@core/decorators/swagger.decorator'

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Version('1')
    @ApiOperation({ summary: 'CreateUser' })
    @ApiResponse({
        type: BaseResponse,
        status: 201,
        description: 'Create User',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.USER_EMAIL_ALREADY_EXIST, USERS_ERRORS.FAILED_CREATE_USER])
    @Post()
    async createUser(@Body() data: createUserRequest): Promise<BaseResponse> {
        const result = await this.usersService.createUser(data)
        const response = plainToInstance(BaseResponse, result)
        return response
    }
}
