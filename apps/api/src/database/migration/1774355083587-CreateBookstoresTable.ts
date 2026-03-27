import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookstoresTable1774355083587 implements MigrationInterface {
  name = 'CreateBookstoresTable1774355083587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bookstores" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "pen_name" VARCHAR(30) NOT NULL,
        "store_name" VARCHAR(50) NOT NULL,
        "bio" TEXT,
        "profile_image" VARCHAR,
        "cover_image" VARCHAR,
        "genre_tags" JSONB DEFAULT '[]',
        "country" VARCHAR(10) NOT NULL DEFAULT 'KR',
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "terms_agreed_at" TIMESTAMPTZ,
        "opened_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bookstores"`);
  }
}
