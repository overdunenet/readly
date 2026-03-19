import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserStatus1773926438602 implements MigrationInterface {
  name = 'AddUserStatus1773926438602';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_status" AS ENUM ('PENDING_PHONE', 'PENDING_PROFILE', 'ACTIVE', 'INACTIVE')`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "status" "user_status" NOT NULL DEFAULT 'PENDING_PHONE'`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_users_status" ON "users" ("status")`
    );

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
