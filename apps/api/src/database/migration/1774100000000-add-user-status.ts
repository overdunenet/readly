import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserStatus1774100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. enum 타입 생성
    await queryRunner.query(
      `CREATE TYPE "user_status" AS ENUM ('PENDING_PHONE', 'PENDING_PROFILE', 'ACTIVE', 'INACTIVE')`
    );

    // 2. status 컬럼 추가 (기본값: PENDING_PHONE)
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "status" "user_status" NOT NULL DEFAULT 'PENDING_PHONE'`
    );

    // 3. 인덱스 생성
    await queryRunner.query(
      `CREATE INDEX "IDX_users_status" ON "users" ("status")`
    );

    // 4. 기존 데이터 처리: phone이 있는 활성 사용자 → PENDING_PROFILE
    await queryRunner.query(
      `UPDATE "users" SET "status" = 'PENDING_PROFILE' WHERE "phone" IS NOT NULL AND "deleted_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_status"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "user_status"`);
  }
}
