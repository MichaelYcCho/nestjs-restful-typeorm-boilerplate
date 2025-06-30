import { applyDecorators, Type } from '@nestjs/common'
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger'

export const PaginatedResponse = <TModel extends Type<any>>(
    model: TModel,
    description: string = '페이지네이션된 목록을 반환합니다.',
) => {
    return applyDecorators(
        ApiExtraModels(model),
        ApiResponse({
            status: 200,
            description,
            schema: {
                type: 'object',
                properties: {
                    total: {
                        type: 'number',
                        example: 100,
                        description: '전체 개수',
                    },
                    pageNumber: {
                        type: 'number',
                        example: 1,
                        description: '페이지 번호',
                    },
                    pageSize: {
                        type: 'number',
                        example: 10,
                        description: '페이지 크기',
                    },
                    data: {
                        type: 'array',
                        description: '목록 데이터',
                        items: {
                            $ref: getSchemaPath(model),
                        },
                    },
                },
            },
        }),
    )
}
