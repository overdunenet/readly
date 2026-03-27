import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePublishDefaultsTable1774357469397
  implements MigrationInterface
{
  name = 'CreatePublishDefaultsTable1774357469397';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "publish_defaults" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "bookstore_id" UUID NOT NULL UNIQUE REFERENCES "bookstores"("id") ON DELETE CASCADE,
        "default_access_level" VARCHAR NOT NULL DEFAULT 'public',
        "default_price" INTEGER NOT NULL DEFAULT 0,
        "default_age_rating" VARCHAR NOT NULL DEFAULT 'all',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "publish_defaults"`);
  }
}
