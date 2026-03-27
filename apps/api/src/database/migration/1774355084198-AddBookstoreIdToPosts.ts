import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookstoreIdToPosts1774355084198 implements MigrationInterface {
  name = 'AddBookstoreIdToPosts1774355084198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "bookstore_id" UUID REFERENCES "bookstores"("id") ON DELETE SET NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "sort_order" INTEGER`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "sort_order"`);

    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "bookstore_id"`);
  }
}
