import * as fs from 'fs';
import * as path from 'path';

export class MigrationFormatter {
  private static migrationsDir = path.join(
    process.cwd(),
    'src/database/migrations',
  );

  /**
   * 가장 최근 마이그레이션 파일을 찾아 포맷팅합니다.
   */
  static formatLatestMigration(): void {
    const filePath = this.getLatestMigrationFile();
    if (filePath) {
      this.formatMigrationFile(filePath);
    } else {
      console.log('포맷팅할 마이그레이션 파일을 찾을 수 없습니다.');
    }
  }

  /**
   * 가장 최근 마이그레이션 파일 경로를 반환합니다.
   */
  private static getLatestMigrationFile(): string | null {
    const files = fs.readdirSync(this.migrationsDir);
    if (files.length === 0) return null;

    const migrationFiles = files
      .filter((file) => /^\d+-.*\.ts$/.test(file))
      .sort((a, b) => {
        const timestampA = parseInt(a.split('-')[0]);
        const timestampB = parseInt(b.split('-')[0]);
        return timestampB - timestampA; // 내림차순
      });

    return migrationFiles.length > 0
      ? path.join(this.migrationsDir, migrationFiles[0])
      : null;
  }

  /**
   * 마이그레이션 파일의 SQL 쿼리를 포맷팅합니다.
   */
  private static formatMigrationFile(filePath: string): void {
    console.log(`포맷팅 파일: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');

    // queryRunner.query 호출 패턴을 찾습니다.
    const formattedContent = content.replace(
      /await queryRunner\.query\(`([^`]+)`\)/g,
      (match, sql) => {
        const formattedSql = this.formatSql(sql);
        return `await queryRunner.query(\`${formattedSql}\`)`;
      },
    );

    fs.writeFileSync(filePath, formattedContent, 'utf8');
    console.log('마이그레이션 파일 포맷팅 완료');
  }

  /**
   * SQL 쿼리 문자열을 포맷팅합니다.
   */
  private static formatSql(sql: string): string {
    // CREATE TABLE 쿼리 포맷팅
    if (sql.includes('CREATE TABLE')) {
      // CREATE TABLE과 COMMENT 부분 분리
      const parts = this.splitCreateTableAndComments(sql);

      // CREATE TABLE 부분 포맷팅
      let formattedTable = this.formatCreateTable(parts.createTable);

      // COMMENT 부분 포맷팅
      const formattedComments = this.formatComments(parts.comments);

      // 결합
      if (formattedComments.length > 0) {
        return `${formattedTable}\n\n${formattedComments}`;
      } else {
        return formattedTable;
      }
    }

    return sql; // 다른 쿼리는 그대로 반환
  }

  /**
   * CREATE TABLE 쿼리와 COMMENT 쿼리를 분리합니다.
   */
  private static splitCreateTableAndComments(sql: string): {
    createTable: string;
    comments: string[];
  } {
    // COMMENT ON COLUMN 패턴 찾기
    const commentRegex =
      /COMMENT ON COLUMN\s+"[^"]+"\."[^"]+"\s+IS\s+'[^']+';?/g;
    const comments: string[] = [];

    // 모든 COMMENT 찾기
    let match;
    while ((match = commentRegex.exec(sql)) !== null) {
      comments.push(match[0]);
    }

    // CREATE TABLE 부분만 추출 (첫 번째 COMMENT 등장 전까지)
    let createTablePart = sql;
    if (comments.length > 0) {
      // 첫 번째 COMMENT 위치 찾기
      const firstCommentIndex = sql.indexOf('COMMENT ON COLUMN');
      if (firstCommentIndex !== -1) {
        createTablePart = sql.substring(0, firstCommentIndex).trim();
      }
    }

    return { createTable: createTablePart, comments };
  }

  /**
   * CREATE TABLE 쿼리를 포맷팅합니다.
   */
  private static formatCreateTable(sql: string): string {
    // 열기 괄호 위치 찾기
    const openParenIndex = sql.indexOf('(');
    if (openParenIndex === -1) return sql;

    // 시작 부분 (CREATE TABLE "table_name" ()
    const prefix = sql.substring(0, openParenIndex + 1);

    // 닫기 괄호 위치 찾기 (마지막 괄호)
    const closeParenIndex = sql.lastIndexOf(')');
    if (closeParenIndex === -1) return sql;

    // 컬럼 정의 부분
    const columnsPart = sql
      .substring(openParenIndex + 1, closeParenIndex)
      .trim();

    // 세미콜론 포함 여부 확인
    const suffix = sql.substring(closeParenIndex);

    // 컬럼들을 쉼표로 분리
    const columns = columnsPart.split(',').map((col) => col.trim());

    // 포맷팅된 컬럼 구성
    const formattedColumns = columns.map((col) => `    ${col}`).join(',\n');

    // 최종 포맷팅된 CREATE TABLE 문
    return `${prefix}\n${formattedColumns}\n${suffix}`;
  }

  /**
   * COMMENT 쿼리들을 포맷팅합니다.
   */
  private static formatComments(comments: string[]): string {
    if (!comments.length) return '';

    // 각 COMMENT를 개별 줄에 배치
    return comments
      .map((comment) => {
        // 세미콜론 추가 (없는 경우)
        if (!comment.endsWith(';')) {
          comment += ';';
        }
        return comment;
      })
      .join('\n');
  }
}
