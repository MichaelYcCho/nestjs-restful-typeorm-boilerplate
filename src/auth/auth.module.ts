import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from '@users/users.module'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './controllers/auth.controller'
import { UserRepository } from '@users/user.repository'
import { AuthService } from './services/auth.service'
import { JwtStorageRepository } from './repository/auth.repository'

@Global()
@Module({})
export class AuthModule {
    static forRoot(): DynamicModule {
        return {
            module: AuthModule,
            imports: [
                ConfigModule,
                UsersModule,
                JwtModule.registerAsync({
                    imports: [ConfigModule],
                    useFactory: async (configService: ConfigService) => ({
                        secret: configService.get<string>('JWT_ACCESS_SECRET'),
                        signOptions: {
                            expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
                        },
                    }),
                    inject: [ConfigService],
                }),
            ],
            providers: [AuthService, JwtStorageRepository, UserRepository],
            controllers: [AuthController],
            exports: [AuthService, JwtModule],
        }
    }
}
