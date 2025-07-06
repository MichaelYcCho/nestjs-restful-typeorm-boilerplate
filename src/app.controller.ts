import { Controller, Get, HttpCode } from '@nestjs/common'

@Controller()
export class AppController {
    constructor() {}

    @Get('/health-check')
    @HttpCode(200)
    getHello(): string {
        return 'OK'
    }
}
