import { MigrationFormatter } from '../migration-formatter'

// 스크립트 실행 시 최신 마이그레이션 파일 포맷팅
MigrationFormatter.formatLatestMigration()

// 스크립트가 종료되도록 함수 실행 후 종료
if (require.main === module) {
    console.log('마이그레이션 포맷팅 완료')
    process.exit(0)
}
