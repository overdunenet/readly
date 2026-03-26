import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCountryAndDropGenreTags1774500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "country" TO "language"`
    );
    await queryRunner.query(
      `ALTER TABLE "bookstores" RENAME COLUMN "country" TO "language"`
    );
    await queryRunner.query(
      `UPDATE "users" SET "language" = 'ko' WHERE "language" = 'KR'`
    );
    await queryRunner.query(
      `UPDATE "bookstores" SET "language" = 'ko' WHERE "language" = 'KR'`
    );
    await queryRunner.query(
      `ALTER TABLE "bookstores" DROP COLUMN "genre_tags"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookstores" ADD COLUMN "genre_tags" JSONB DEFAULT '[]'`
    );
    await queryRunner.query(
      `UPDATE "users" SET "language" = 'KR' WHERE "language" = 'ko'`
    );
    await queryRunner.query(
      `UPDATE "bookstores" SET "language" = 'KR' WHERE "language" = 'ko'`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "language" TO "country"`
    );
    await queryRunner.query(
      `ALTER TABLE "bookstores" RENAME COLUMN "language" TO "country"`
    );
  }
}
