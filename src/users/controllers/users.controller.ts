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
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger'
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
import { DataResponse } from '@core/decorators/response/data-response.decorator'
import { ExceptionHandler } from '@core/errors/error.handler'

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
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
    @ApiBearerAuth('JWT-auth')
    @Version('1')
    @ApiOperation({ summary: 'GetUserById' })
    @DataResponse(UserDto, 'Get User Detail')
    @ApiErrorResponse(400, [USERS_ERRORS.NOT_EXIST_USER, USERS_ERRORS.FAILED_GET_USER_PROFILE])
    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<BaseDataResponse<UserDto>> {
        // id param validation - 정수이고 양수인지 확인
        const userId = Number(id)
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new ExceptionHandler(USERS_ERRORS.NOT_EXIST_USER)
        }
        const result = await this.usersService.getUserById(userId)
        const response = plainToInstance(BaseDataResponse<UserDto>, result)
        return response
    }

    @Version('1')
    @ApiOperation({ summary: 'CreateUser' })
    @DataResponse(UserDto, 'Create User', 201)
    @ApiErrorResponse(400, [USERS_ERRORS.USER_EMAIL_ALREADY_EXIST, USERS_ERRORS.FAILED_CREATE_USER])
    @Post()
    async createUser(@Body() data: createUserDto): Promise<BaseIdResponse> {
        const result = await this.usersService.createUser(data)
        const response = plainToInstance(BaseIdResponse, result)
        return response
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Version('1')
    @ApiOperation({ summary: 'UpdateUser' })
    @DataResponse(UserDto, 'Update User')
    @ApiErrorResponse(400, [USERS_ERRORS.USER_EMAIL_ALREADY_EXIST, USERS_ERRORS.FAILED_CREATE_USER])
    @Patch('')
    async updateUser(@getUser() user, @Body() data: updateUserDto): Promise<BaseDataResponse<UserDto>> {
        const result = await this.usersService.updateUser(user, data)
        const response = plainToInstance(BaseDataResponse<UserDto>, result)
        return response
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Version('1')
    @ApiOperation({ summary: 'DeleteUser' })
    @DataResponse(UserDto, 'Delete User')
    @ApiErrorResponse(400, [USERS_ERRORS.FAILED_DELETE_USER])
    @Delete()
    async deleteUser(@getUser() user: User): Promise<BaseResponse> {
        const result = await this.usersService.deleteUser(user)
        const response = plainToInstance(BaseResponse, result)
        return response
    }
}
