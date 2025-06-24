import { UserRole } from '@core/utils/constant'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export class FilterUsersDto {
    @ApiProperty({ description: '페이지 번호', default: 1, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    pageNumber: number = 1

    @ApiProperty({ description: '페이지 크기', default: 10, example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    pageSize: number = 10

    @ApiPropertyOptional({
        description: '검색 키워드 (이메일 또는 프로필명)',
        required: false,
    })
    @IsString()
    @IsOptional()
    searchKeyword?: string

    @ApiPropertyOptional({
        description: '사용자 역할',
        enum: UserRole,
        required: false,
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole

    @ApiPropertyOptional({
        description: '활성화 여부',
        required: false,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}
