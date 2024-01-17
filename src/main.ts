import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { GlobalExceptionsFilter } from '@core/errors/exception.filter'

declare const module: any

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    // Error Handler Setting
    app.useGlobalFilters(new GlobalExceptionsFilter())
    await app.listen(3000)

    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}
bootstrap()
