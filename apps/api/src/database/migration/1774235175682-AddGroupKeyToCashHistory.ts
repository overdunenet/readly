import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupKeyToCashHistory1774235175682
  implements MigrationInterface
{
  name = 'AddGroupKeyToCashHistory1774235175682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cash_history" ADD COLUMN "group_key" uuid NOT NULL DEFAULT gen_random_uuid()`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cash_history_group_key" ON "cash_history" ("group_key")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_cash_history_group_key"`);
    await queryRunner.query(
      `ALTER TABLE "cash_history" DROP COLUMN "group_key"`
    );
  }
}
