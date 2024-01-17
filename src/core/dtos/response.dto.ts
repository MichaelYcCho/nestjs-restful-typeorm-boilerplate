import { IsBoolean, IsString } from 'class-validator'

export class CoreResponse {
    @IsBoolean()
    isSuccess: boolean

    @IsString()
    message: string
}
