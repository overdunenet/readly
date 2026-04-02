import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostVersions1775115140869 implements MigrationInterface {
  name = 'CreatePostVersions1775115140869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. post_versions 테이블 생성
    await queryRunner.query(
      `CREATE TABLE "post_versions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "post_id" uuid NOT NULL,
        "version_number" integer NOT NULL DEFAULT 1,
        "title" varchar NOT NULL DEFAULT '',
        "free_content" text NOT NULL DEFAULT '',
        "paid_content" text,
        "excerpt" text,
        "thumbnail" varchar,
        "save_type" varchar NOT NULL DEFAULT 'manual',
        CONSTRAINT "PK_post_versions" PRIMARY KEY ("id")
      )`
    );

    // 2. post_id + version_number 유니크 인덱스
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_post_versions_post_id_version_number" ON "post_versions" ("post_id", "version_number")`
    );

    // 3. post_id FK 제약
    await queryRunner.query(
      `ALTER TABLE "post_versions" ADD CONSTRAINT "FK_post_versions_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE`
    );

    // 4. 기존 posts 데이터를 post_versions로 이관 (soft-deleted 포함)
    await queryRunner.query(
      `INSERT INTO "post_versions" ("id", "created_at", "updated_at", "post_id", "version_number", "title", "free_content", "paid_content", "excerpt", "thumbnail", "save_type")
       SELECT uuid_generate_v4(), now(), now(), "id", 1, COALESCE("title", ''), COALESCE("free_content", ''), "paid_content", "excerpt", "thumbnail", 'manual'
       FROM "posts"`
    );

    // 5. posts에 published_version_id 컬럼 추가
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "published_version_id" uuid`
    );

    // 6. published 상태의 포스트에 version 연결
    await queryRunner.query(
      `UPDATE "posts" SET "published_version_id" = "pv"."id"
       FROM "post_versions" "pv"
       WHERE "posts"."id" = "pv"."post_id" AND "pv"."version_number" = 1 AND "posts"."status" = 'published'`
    );

    // 7. published_version_id FK 제약
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_posts_published_version_id" FOREIGN KEY ("published_version_id") REFERENCES "post_versions"("id")`
    );

    // 8-12. posts 테이블에서 콘텐츠 컬럼 제거
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "free_content"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "paid_content"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "thumbnail"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1-5. posts 테이블에 콘텐츠 컬럼 복원
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "title" varchar NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "free_content" text NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "paid_content" text`
    );
    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "excerpt" text`);
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "thumbnail" varchar`
    );

    // 6. post_versions에서 최신 버전 데이터를 posts로 복원
    await queryRunner.query(
      `UPDATE "posts" SET "title" = "pv"."title", "free_content" = "pv"."free_content", "paid_content" = "pv"."paid_content", "excerpt" = "pv"."excerpt", "thumbnail" = "pv"."thumbnail"
       FROM "post_versions" "pv"
       WHERE "posts"."id" = "pv"."post_id" AND "pv"."version_number" = (
         SELECT MAX("version_number") FROM "post_versions" WHERE "post_id" = "posts"."id"
       )`
    );

    // 7. published_version_id FK 제약 제거
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_published_version_id"`
    );

    // 8. published_version_id 컬럼 제거
    await queryRunner.query(
      `ALTER TABLE "posts" DROP COLUMN "published_version_id"`
    );

    // 9. post_versions FK 제약 제거
    await queryRunner.query(
      `ALTER TABLE "post_versions" DROP CONSTRAINT "FK_post_versions_post_id"`
    );

    // 10. 유니크 인덱스 제거
    await queryRunner.query(
      `DROP INDEX "UQ_post_versions_post_id_version_number"`
    );

    // 11. post_versions 테이블 제거
    await queryRunner.query(`DROP TABLE "post_versions"`);
  }
}
