import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookstoreReviewsTable1774357472803
  implements MigrationInterface
{
  name = 'CreateBookstoreReviewsTable1774357472803';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bookstore_reviews" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "bookstore_id" UUID NOT NULL REFERENCES "bookstores"("id") ON DELETE CASCADE,
        "reviewer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "uq_bookstore_reviews_bookstore_reviewer" UNIQUE ("bookstore_id", "reviewer_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bookstore_reviews"`);
  }
}
