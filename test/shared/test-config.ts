// 테스트 환경 설정
export const TEST_CONFIG = {
    // 데이터베이스 설정
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: +(process.env.DB_PORT || 5432),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'test_db',
    },

    // 타임아웃 설정
    timeouts: {
        setup: 30000, // beforeAll/afterAll
        test: 15000, // 일반 테스트
        short: 5000, // 빠른 테스트
        long: 30000, // 긴 테스트
    },

    // 테스트 데이터
    testUsers: {
        first: {
            email: 'alice@gmail.com',
            password: '1234',
            profileName: 'Alice',
        },
        second: {
            email: 'bob@gmail.com',
            password: '5678',
            profileName: 'Bob',
        },
        third: {
            email: 'charlie@gmail.com',
            password: '9012',
            profileName: 'Charlie',
        },
    },
}

// 데이터베이스 연결 설정 생성
export const createTestDataSource = () => ({
    type: 'postgres' as const,
    host: TEST_CONFIG.database.host,
    port: TEST_CONFIG.database.port,
    username: TEST_CONFIG.database.username,
    password: TEST_CONFIG.database.password,
    database: TEST_CONFIG.database.database,
    synchronize: true, // 테스트용으로 동기화 활성화
    logging: false, // 로깅 비활성화로 성능 향상
    entities: ['src/**/*.entity.ts'],
})
