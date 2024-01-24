import { utilities, WinstonModule } from 'nest-winston'
import winstonDaily from 'winston-daily-rotate-file'
import * as winston from 'winston'
import { IGNORE_PATTERNS } from '@core/utils/constant'

const logDir = process.env.LOG_DIR || '../logs'

const ignoreFilter = winston.format((info, opts) => {
    /*
        Comments:
            info: 자동으로 전달되는 매개인자, 로그 메시지가 담겨있음
            opts: 커스텀 필터에서 전달받은 매개인자, ignorePatterns가 담겨있음
    */
    if (opts && opts.ignorePatterns) {
        for (const pattern of opts.ignorePatterns) {
            if (info.message.includes(pattern)) {
                return false // ignored include pattern
            }
        }
    }
    return info
})

const createDailyLogFile = (level: string): winstonDaily.DailyRotateFileTransportOptions => {
    return {
        level,
        datePattern: 'YYYY-MM-DD',
        format: winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.json(),
        ),
        dirname: logDir + `/${level}`,
        filename: `%DATE%.${level}.log`, // daily rotate file name
        maxFiles: 30,
        zippedArchive: true,
    }
}
const color = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

winston.addColors(color)

// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6 (숫자가 낮을수록 우선순위가 높음)
export const winstonLogger = WinstonModule.createLogger({
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'dev' ? 'silly' : 'info',
            format: winston.format.combine(
                ignoreFilter({ ignorePatterns: IGNORE_PATTERNS }), // ignorePatterns: string[]
                winston.format.colorize({ all: true }),
                winston.format.timestamp(),
                utilities.format.nestLike('Winston', {
                    prettyPrint: true,
                }),
            ),
        }),
        new winstonDaily(createDailyLogFile('error')),
        new winstonDaily(createDailyLogFile('warn')),
        new winstonDaily(createDailyLogFile('info')),
    ],
})
