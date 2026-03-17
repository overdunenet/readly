import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneOtp1773700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. users 테이블에 phone 컬럼 추가
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "phone" VARCHAR NULL`
    );

    // 2. phone에 partial unique index (active 레코드만)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_phone_active" ON "users" ("phone") WHERE "deleted_at" IS NULL AND "phone" IS NOT NULL`
    );

    // 3. otp_verifications 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "otp_verifications" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "phone" VARCHAR NOT NULL,
        "code" VARCHAR(6) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_otp_verifications" PRIMARY KEY ("id")
      )
    `);

    // 4. phone 인덱스
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_phone" ON "otp_verifications" ("phone")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_otp_phone"`);
    await queryRunner.query(`DROP TABLE "otp_verifications"`);
    await queryRunner.query(`DROP INDEX "UQ_users_phone_active"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
  }
}
