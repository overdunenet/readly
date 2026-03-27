import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOpenedAtFromBookstores1774513294279
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookstores" DROP COLUMN "opened_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookstores" ADD COLUMN "opened_at" TIMESTAMPTZ`
    );
  }
}
