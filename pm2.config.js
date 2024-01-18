module.exports = {
    apps: [
        {
            name: 'boilerplate-dev',
            script: 'dist/main.js',
            exec_mode: 'fork',
            instances: 1,
            out_file: '/app/logs/pm2/info.log',
            error_file: '/app/logs/pm2/error.log',
            merge_logs: true,
            time: true,
            log_date_format: 'YYY-MM-DD HH:mm Z',
            autorestart: true,
            shutdown_with_message: true,
            env: {
                NODE_ENV: 'dev',
            },
        },
    ],
}
