import { MigrationInterface, QueryRunner } from 'typeorm';

export class refactorSocialAccountsToOneToMany1773748321334
  implements MigrationInterface
{
  name = 'refactorSocialAccountsToOneToMany1773748321334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 새 컬럼 추가
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD COLUMN "provider" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD COLUMN "account_id" character varying`
    );

    // 2. 데이터 변환: 기존 provider별 ID를 provider + account_id로 변환
    // naver_id가 있는 row
    await queryRunner.query(
      `UPDATE "social_accounts" SET "provider" = 'naver', "account_id" = "naver_id"
       WHERE "naver_id" IS NOT NULL AND "provider" IS NULL`
    );

    // kakao_id가 있는데 아직 provider IS NULL인 row (naver_id가 없는 경우)
    await queryRunner.query(
      `UPDATE "social_accounts" SET "provider" = 'kakao', "account_id" = "kakao_id"
       WHERE "kakao_id" IS NOT NULL AND "provider" IS NULL`
    );

    // kakao_id가 있는데 이미 naver로 세팅된 row → 새 row INSERT
    await queryRunner.query(
      `INSERT INTO "social_accounts" ("id", "created_at", "updated_at", "user_id", "provider", "account_id", "deleted_at")
       SELECT uuid_generate_v4(), now(), now(), "user_id", 'kakao', "kakao_id", "deleted_at"
       FROM "social_accounts" WHERE "kakao_id" IS NOT NULL AND "provider" = 'naver'`
    );

    // google_id 동일 패턴 (현재 미사용이지만 방어적 처리)
    await queryRunner.query(
      `UPDATE "social_accounts" SET "provider" = 'google', "account_id" = "google_id"
       WHERE "google_id" IS NOT NULL AND "provider" IS NULL`
    );

    await queryRunner.query(
      `INSERT INTO "social_accounts" ("id", "created_at", "updated_at", "user_id", "provider", "account_id", "deleted_at")
       SELECT uuid_generate_v4(), now(), now(), "user_id", 'google', "google_id", "deleted_at"
       FROM "social_accounts" WHERE "google_id" IS NOT NULL AND "provider" != 'google'`
    );

    // 3. provider IS NULL인 빈 row 삭제 + NOT NULL 설정
    await queryRunner.query(
      `DELETE FROM "social_accounts" WHERE "provider" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ALTER COLUMN "provider" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ALTER COLUMN "account_id" SET NOT NULL`
    );

    // 4. 기존 인덱스/제약조건 삭제
    await queryRunner.query(`DROP INDEX "UQ_social_accounts_naver_id_active"`);
    await queryRunner.query(`DROP INDEX "UQ_social_accounts_kakao_id_active"`);
    await queryRunner.query(`DROP INDEX "UQ_social_accounts_google_id_active"`);
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP CONSTRAINT "UQ_social_accounts_user_id"`
    );

    // 5. 기존 컬럼 삭제
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "naver_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "kakao_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "google_id"`
    );

    // 6. 새 인덱스 생성
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_social_accounts_provider_account_id_active"
       ON "social_accounts" ("provider", "account_id") WHERE "deleted_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 새 인덱스 삭제
    await queryRunner.query(
      `DROP INDEX "UQ_social_accounts_provider_account_id_active"`
    );

    // 2. 기존 컬럼 복원
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD COLUMN "naver_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD COLUMN "kakao_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD COLUMN "google_id" character varying`
    );

    // 3. 데이터 역변환
    await queryRunner.query(
      `UPDATE "social_accounts" SET "naver_id" = "account_id" WHERE "provider" = 'naver'`
    );
    await queryRunner.query(
      `UPDATE "social_accounts" SET "kakao_id" = "account_id" WHERE "provider" = 'kakao'`
    );
    await queryRunner.query(
      `UPDATE "social_accounts" SET "google_id" = "account_id" WHERE "provider" = 'google'`
    );

    // 4. 1:N에서 분리된 row 중 동일 user_id의 중복 제거 (첫 번째만 유지)
    await queryRunner.query(
      `DELETE FROM "social_accounts" a USING "social_accounts" b
       WHERE a."user_id" = b."user_id" AND a."created_at" > b."created_at"`
    );

    // 5. user_id UNIQUE 제약조건 복원
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD CONSTRAINT "UQ_social_accounts_user_id" UNIQUE ("user_id")`
    );

    // 6. 기존 인덱스 복원
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_social_accounts_naver_id_active" ON "social_accounts" ("naver_id") WHERE "deleted_at" IS NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_social_accounts_kakao_id_active" ON "social_accounts" ("kakao_id") WHERE "deleted_at" IS NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_social_accounts_google_id_active" ON "social_accounts" ("google_id") WHERE "deleted_at" IS NULL`
    );

    // 7. 새 컬럼 삭제
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "account_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "provider"`
    );
  }
}
