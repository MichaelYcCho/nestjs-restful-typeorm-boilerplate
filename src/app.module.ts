import * as Joi from 'joi'
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeORMConfig } from '@config/typeorm.config'
import { DataSource } from 'typeorm'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { LoggerModule } from './logger/logger.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `./env/.env.${process.env.NODE_ENV}`,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid('dev', 'test', 'prod').required(),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.string().required(),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_NAME: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => typeORMConfig(configService),
            dataSourceFactory: async (options) => {
                return await new DataSource(options).initialize()
            },
        }),
        AuthModule.forRoot(),
        LoggerModule.forRoot(),
        UsersModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
