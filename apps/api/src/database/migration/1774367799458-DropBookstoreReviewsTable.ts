import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropBookstoreReviewsTable1774367799458
  implements MigrationInterface
{
  name = 'DropBookstoreReviewsTable1774367799458';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bookstore_reviews"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bookstore_reviews" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "bookstore_id" UUID NOT NULL REFERENCES "bookstores"("id") ON DELETE CASCADE,
        "reviewer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uq_bookstore_reviews_bookstore_reviewer" UNIQUE ("bookstore_id", "reviewer_id")
      )
    `);
  }
}
