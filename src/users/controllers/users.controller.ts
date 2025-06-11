import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Version } from '@nestjs/common'
import { UsersService } from '../services/users.service'

import { plainToInstance } from 'class-transformer'
import { BaseResponse } from '@core/dto/response.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { USERS_ERRORS } from '@core/errors/error.list'
import { ApiErrorResponse } from '@core/decorators/swagger.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt.access.guard'
import { getUser } from '@core/decorators/getUser.decorator'
import { createUserDto } from '@users/dto/create-user.dto'
import { UserDto } from '@users/dto/user.dto'
import { updateUserDto } from '@users/dto/update-user.dto'

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Version('1')
    @ApiOperation({ summary: 'CreateUser' })
    @ApiResponse({
        type: BaseResponse,
        status: 201,
        description: 'Create User',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.USER_EMAIL_ALREADY_EXIST, USERS_ERRORS.FAILED_CREATE_USER])
    @Post('/create')
    async createUser(@Body() data: createUserDto): Promise<BaseResponse> {
        const result = await this.usersService.createUser(data)
        const response = plainToInstance(BaseResponse, result)
        return response
    }

    @UseGuards(JwtAuthGuard)
    @Version('1')
    @ApiOperation({ summary: 'UpdateUser' })
    @ApiResponse({
        type: UserDto,
        status: 200,
        description: 'Update User',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.USER_EMAIL_ALREADY_EXIST, USERS_ERRORS.FAILED_CREATE_USER])
    @Patch('/update')
    async updateUser(@getUser() user, @Body() data: updateUserDto): Promise<UserDto> {
        const result = await this.usersService.updateUser(user, data)
        const response = plainToInstance(UserDto, result)
        return response
    }
}
