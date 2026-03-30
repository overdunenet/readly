import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowEmptyDraftPost1774844748197 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "title" SET DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "content" SET DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "title" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "content" DROP DEFAULT`
    );
  }
}
