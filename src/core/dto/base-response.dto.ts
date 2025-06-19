import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class BaseResponse {
  @ApiProperty({
    example: 'error message',
    description: 'Error Message',
  })
  @IsString()
  message: string;
}

export class BaseCreateResponse {
  @ApiProperty({
    example: 'success',
    description: 'Success Message',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: 1,
    description: 'Created Entity ID',
  })
  @IsNumber()
  id: number;
}

export class BasePaginatedResponse<T> {
  @ApiProperty({
    example: 100,
    description: '전체 데이터 개수',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: '현재 페이지 번호',
  })
  pageNumber: number;

  @ApiProperty({
    example: 10,
    description: '페이지당 데이터 개수',
  })
  pageSize: number;

  @ApiProperty({
    description: '페이지네이션된 데이터',
  })
  data: T;
}

export class BaseDataResponse<T> {
  @ApiProperty({ description: '응답 데이터' })
  data: T;
}

export class ErrorResponse {
  @ApiProperty({ example: 400, description: 'HTTP Status Code' })
  status: number;

  @ApiProperty({ example: 100005, description: 'Error Code' })
  errorCode: number;

  @ApiProperty({ example: 'Invalid Request', description: 'Error Message' })
  errorMessage: string;

  @ApiProperty({ example: '/api/v1/core', description: 'error path' })
  path: string;

  @ApiProperty({
    example: '2024-01-17T02:51:29.144Z',
    description: 'timestamp',
  })
  timestamp: string;
}
