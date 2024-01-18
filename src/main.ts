import basicAuth from 'express-basic-auth'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { GlobalExceptionsFilter } from '@core/errors/exception.filter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { VersioningType } from '@nestjs/common'

declare const module: any

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    // Error Handler Setting
    app.useGlobalFilters(new GlobalExceptionsFilter())

    // Swagger Setting
    if (process.env.NODE_ENV === 'stg' || process.env.NODE_ENV === 'prod') {
        const SWAGGER_PWD = process.env.SWAGGER_PWD
        app.use(
            ['/docs'],
            basicAuth({
                challenge: true,
                users: {
                    admin: SWAGGER_PWD,
                },
            }),
        )
    }

    app.enableVersioning({
        type: VersioningType.URI,
    })
    app.setGlobalPrefix(process.env.GLOBAL_API_PREFIX)

    const config = new DocumentBuilder()
        .setTitle('Nest Boilerplate API')
        .setDescription('Nest Boilerplate API')
        .setVersion('1.0')
        .addTag('Boilerplate')
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)

    await app.listen(3000)

    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}
bootstrap()
