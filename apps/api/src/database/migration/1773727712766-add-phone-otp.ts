import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneOtp1773727712766 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "phone" VARCHAR NULL`
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_phone_active" ON "users" ("phone") WHERE "deleted_at" IS NULL AND "phone" IS NOT NULL`
    );

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
