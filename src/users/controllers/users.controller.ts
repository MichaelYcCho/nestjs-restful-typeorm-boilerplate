import { Body, Controller, Patch, Post, UseGuards, Version } from '@nestjs/common'
import { UserService } from '../services/users.service'
import { UserResponse, createUserRequest, updateUserRequest } from '../dtos/user.dto'
import { plainToInstance } from 'class-transformer'
import { BaseResponse } from '@core/dtos/response.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { USERS_ERRORS } from '@core/errors/error.list'
import { ApiErrorResponse } from '@core/decorators/swagger.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt.access.guard'
import { getUser } from '@core/decorators/getUser.decorator'

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
    @Post('/create')
    async createUser(@Body() data: createUserRequest): Promise<BaseResponse> {
        const result = await this.usersService.createUser(data)
        const response = plainToInstance(BaseResponse, result)
        return response
    }

    @UseGuards(JwtAuthGuard)
    @Version('1')
    @ApiOperation({ summary: 'UpdateUser' })
    @ApiResponse({
        type: UserResponse,
        status: 200,
        description: 'Update User',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.USER_EMAIL_ALREADY_EXIST, USERS_ERRORS.FAILED_CREATE_USER])
    @Patch('/update')
    async updateUser(@getUser() user, @Body() data: updateUserRequest): Promise<UserResponse> {
        const result = await this.usersService.updateUser(data)
        const response = plainToInstance(UserResponse, result)
        return response
    }
}
