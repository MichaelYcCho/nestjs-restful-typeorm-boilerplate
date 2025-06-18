import { DataSource, Repository } from 'typeorm'
import { User } from 'src/users/entities/user.entity'
import { JwtStorage } from 'src/auth/entities/jwt-storage.entity'

/**
 * 데이터베이스 정리 헬퍼 함수
 * 외래 키 제약 조건을 고려하여 안전하게 데이터를 정리합니다.
 */
export class DatabaseTestHelper {
    constructor(
        private dataSource: DataSource,
        private usersRepository: Repository<User>,
        private jwtStorageRepository: Repository<JwtStorage>,
    ) {}

    /**
     * 모든 테스트 데이터를 정리합니다.
     */
    async cleanupAll(): Promise<void> {
        if (!this.dataSource || !this.dataSource.isInitialized) {
            return
        }

        try {
            // 외래 키 제약 조건을 비활성화하고 정리
            await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0')

            // 순서대로 삭제 (자식 테이블부터)
            await this.jwtStorageRepository.delete({})
            await this.usersRepository.delete({})

            // 외래 키 제약 조건을 다시 활성화
            await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1')

            // 시퀀스 리셋 (PostgreSQL)
            await this.resetSequences()
        } catch (error) {
            console.log('Database cleanup warning:', error.message)

            // PostgreSQL의 경우 다른 방식으로 시도
            try {
                await this.cleanupPostgreSQL()
            } catch (pgError) {
                console.log('PostgreSQL cleanup warning:', pgError.message)
            }
        }
    }

    /**
     * PostgreSQL 전용 정리 함수
     */
    private async cleanupPostgreSQL(): Promise<void> {
        try {
            // CASCADE를 사용하여 관련 데이터 모두 삭제
            await this.dataSource.query('TRUNCATE TABLE jwt_storage, "user" RESTART IDENTITY CASCADE')
        } catch (error) {
            // TRUNCATE가 실패하면 DELETE 사용
            await this.jwtStorageRepository.delete({})
            await this.usersRepository.delete({})
            await this.resetSequences()
        }
    }

    /**
     * 시퀀스 리셋
     */
    private async resetSequences(): Promise<void> {
        try {
            await this.dataSource.query('ALTER SEQUENCE IF EXISTS user_id_seq RESTART WITH 1')
            await this.dataSource.query('ALTER SEQUENCE IF EXISTS jwt_storage_id_seq RESTART WITH 1')
        } catch (error) {
            // 시퀀스가 존재하지 않거나 다른 DBMS인 경우 무시
            console.log('Sequence reset warning:', error.message)
        }
    }

    /**
     * 특정 사용자와 관련된 데이터만 정리
     */
    async cleanupUser(userId: number): Promise<void> {
        try {
            // JWT Storage 먼저 삭제
            await this.jwtStorageRepository.delete({ user: { id: userId } })

            // 사용자 삭제
            await this.usersRepository.delete({ id: userId })
        } catch (error) {
            console.log('User cleanup warning:', error.message)
        }
    }

    /**
     * 데이터베이스 연결 상태 확인
     */
    isConnected(): boolean {
        return this.dataSource && this.dataSource.isInitialized
    }
}

/**
 * 테스트 타임아웃 헬퍼
 */
export const TestTimeouts = {
    SETUP: 30000, // beforeAll/afterAll
    TEST: 15000, // 일반 테스트
    SHORT: 5000, // 빠른 테스트 (인증 실패 등)
    LONG: 30000, // 긴 테스트 (복잡한 통합 테스트)
} as const

/**
 * 테스트 로그 헬퍼
 */
export class TestLogger {
    static info(message: string, data?: any): void {
        console.log(`[TEST INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    }

    static warn(message: string, error?: any): void {
        console.warn(`[TEST WARN] ${message}`, error?.message || error)
    }

    static error(message: string, error?: any): void {
        console.error(`[TEST ERROR] ${message}`, error?.message || error)
    }

    static success(message: string): void {
        console.log(`[TEST SUCCESS] ✅ ${message}`)
    }
}
