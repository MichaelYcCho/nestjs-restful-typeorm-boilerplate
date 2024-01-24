import { DynamicModule, Global, Module } from '@nestjs/common'
import { LoggerHandler } from './logger.service'

@Global()
@Module({})
export class LoggerModule {
    static forRoot(): DynamicModule {
        return {
            module: LoggerModule,
            providers: [LoggerHandler],
            exports: [LoggerHandler],
        }
    }
}
