import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNicknameUniqueIndex1773988617450 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_users_nickname_hash" ON "users" USING hash ("nickname")`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_nickname_unique" ON "users" ("nickname") WHERE "deleted_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_nickname_unique"`);
    await queryRunner.query(`DROP INDEX "IDX_users_nickname_hash"`);
  }
}
