case "$NODE_ENV" in
    "dev")
        pm2-runtime start pm2.config.js --only boilerplate-dev --env dev
        ;;
    "dev.docker")
        pm2-runtime start pm2.config.js --only boilerplate-dev-docker --env dev.docker
        ;;
    "prod")
        pm2-runtime start pm2.config.js --only boilerplate-prod --env prod
        ;;
    *)
        echo "Unknown environment: $NODE_ENV"
        exit 1
        ;;
esac