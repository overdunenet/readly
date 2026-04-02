import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitContentToFreeAndPaid1774939410762
  implements MigrationInterface
{
  name = 'SplitContentToFreeAndPaid1774939410762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "content" TO "free_content"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "paid_content" text DEFAULT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "paid_content"`);
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "free_content" TO "content"`
    );
  }
}
