import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertPublishDefaultToEmbedded1774442091393
  implements MigrationInterface
{
  name = 'ConvertPublishDefaultToEmbedded1774442091393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. bookstores 테이블에 embedded 컬럼 추가
    await queryRunner.query(
      `ALTER TABLE "bookstores" ADD COLUMN "publish_default_default_access_level" VARCHAR NOT NULL DEFAULT 'public'`
    );
    await queryRunner.query(
      `ALTER TABLE "bookstores" ADD COLUMN "publish_default_default_price" INTEGER NOT NULL DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "bookstores" ADD COLUMN "publish_default_default_age_rating" VARCHAR NOT NULL DEFAULT 'all'`
    );

    // 2. 기존 데이터 이전
    await queryRunner.query(`
      UPDATE "bookstores" b SET
        "publish_default_default_access_level" = pd."default_access_level",
        "publish_default_default_price" = pd."default_price",
        "publish_default_default_age_rating" = pd."default_age_rating"
      FROM "publish_defaults" pd
      WHERE pd."bookstore_id" = b."id"
    `);

    // 3. publish_defaults 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "publish_defaults"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. publish_defaults 테이블 재생성
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

    // 2. 데이터 복원
    await queryRunner.query(`
      INSERT INTO "publish_defaults" ("bookstore_id", "default_access_level", "default_price", "default_age_rating")
      SELECT "id", "publish_default_default_access_level", "publish_default_default_price", "publish_default_default_age_rating"
      FROM "bookstores"
    `);

    // 3. bookstores 테이블에서 embedded 컬럼 삭제
    await queryRunner.query(
      `ALTER TABLE "bookstores" DROP COLUMN "publish_default_default_age_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "bookstores" DROP COLUMN "publish_default_default_price"`
    );
    await queryRunner.query(
      `ALTER TABLE "bookstores" DROP COLUMN "publish_default_default_access_level"`
    );
  }
}
