import { applyDecorators, Type } from '@nestjs/common'
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger'

export const DataResponse = <TModel extends Type<any>>(
    model: TModel,
    description: string = '데이터를 반환합니다.',
    status: number = 200,
) => {
    return applyDecorators(
        ApiExtraModels(model),
        ApiResponse({
            status,
            description,
            schema: {
                type: 'object',
                properties: {
                    data: {
                        $ref: getSchemaPath(model),
                    },
                },
            },
        }),
    )
}
