import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    Version,
    ValidationPipe,
} from '@nestjs/common'
import { UsersService } from '../services/users.service'

import { plainToInstance } from 'class-transformer'

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { USERS_ERRORS } from '@core/errors/error.list'
import { ApiErrorResponse } from '@core/decorators/swagger.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt.access.guard'
import { getUser } from '@core/decorators/getUser.decorator'
import { createUserDto } from '@users/dto/create-user.dto'
import { UserDto } from '@users/dto/user.dto'
import { updateUserDto } from '@users/dto/update-user.dto'
import { User } from '@users/entities/user.entity'
import { BaseDataResponse, BaseIdResponse, BasePaginatedResponse, BaseResponse } from '@core/dto/base-response.dto'
import { FilterUsersDto } from '@users/dto/filter-dto'
import { PaginatedResponse } from '@core/decorators/response/paginated-response.decorator'

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Version('1')
    @ApiOperation({ summary: 'GetAllUsers' })
    @PaginatedResponse(UserDto, 'Paginated Response')
    @ApiErrorResponse(400, [USERS_ERRORS.FAILED_GET_USER_PROFILE])
    @Get()
    async getUserList(
        @Query(new ValidationPipe({ transform: true })) filterDto: FilterUsersDto,
    ): Promise<BasePaginatedResponse<UserDto[]>> {
        const { users, count } = await this.usersService.getUserList(filterDto)

        const usersDto = users.map((user) =>
            plainToInstance(UserDto, user, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
        )

        return {
            total: count,
            pageNumber: filterDto.pageNumber || 1,
            pageSize: filterDto.pageSize || 10,
            data: usersDto,
        }
    }

    @UseGuards(JwtAuthGuard)
    @Version('1')
    @ApiOperation({ summary: 'GetUserById' })
    @ApiResponse({
        type: BaseDataResponse<UserDto>,
        status: 200,
        description: 'Get User Detail',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.NOT_EXIST_USER, USERS_ERRORS.FAILED_GET_USER_PROFILE])
    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<BaseDataResponse<UserDto>> {
        const userId = parseInt(id, 10)
        if (isNaN(userId)) {
            throw new Error('Invalid user ID')
        }
        const result = await this.usersService.getUserById(userId)
        return plainToInstance(BaseDataResponse<UserDto>, result)
    }

    @Version('1')
    @ApiOperation({ summary: 'CreateUser' })
    @ApiResponse({
        type: BaseIdResponse,
        status: 201,
        description: 'Create User',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.USER_EMAIL_ALREADY_EXIST, USERS_ERRORS.FAILED_CREATE_USER])
    @Post()
    async createUser(@Body() data: createUserDto): Promise<BaseIdResponse> {
        const result = await this.usersService.createUser(data)
        const response = plainToInstance(BaseIdResponse, result)
        return response
    }

    @UseGuards(JwtAuthGuard)
    @Version('1')
    @ApiOperation({ summary: 'UpdateUser' })
    @ApiResponse({
        type: BaseDataResponse<UserDto>,
        status: 200,
        description: 'Update User',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.USER_EMAIL_ALREADY_EXIST, USERS_ERRORS.FAILED_CREATE_USER])
    @Patch('')
    async updateUser(@getUser() user, @Body() data: updateUserDto): Promise<BaseDataResponse<UserDto>> {
        const result = await this.usersService.updateUser(user, data)
        const response = plainToInstance(BaseDataResponse<UserDto>, result)
        return response
    }

    @UseGuards(JwtAuthGuard)
    @Version('1')
    @ApiOperation({ summary: 'DeleteUser' })
    @ApiResponse({
        type: BaseResponse,
        status: 200,
        description: 'Delete User',
    })
    @ApiErrorResponse(400, [USERS_ERRORS.FAILED_DELETE_USER])
    @Delete()
    async deleteUser(@getUser() user: User): Promise<BaseResponse> {
        const result = await this.usersService.deleteUser(user)
        const response = plainToInstance(BaseResponse, result)
        return response
    }
}
