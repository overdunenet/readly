import { MigrationInterface, QueryRunner } from 'typeorm';

export class posts1753715719917 implements MigrationInterface {
  name = 'posts1753715719917';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "posts"
                                 (
                                     "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "created_at"   TIMESTAMP         NOT NULL DEFAULT now(),
                                     "updated_at"   TIMESTAMP         NOT NULL DEFAULT now(),
                                     "title"        character varying NOT NULL,
                                     "content"      text              NOT NULL,
                                     "excerpt"      text,
                                     "thumbnail"    character varying,
                                     "access_level" character varying NOT NULL DEFAULT 'public',
                                     "status"       character varying NOT NULL DEFAULT 'draft',
                                     "price"        integer           NOT NULL DEFAULT '0',
                                     "published_at" TIMESTAMP WITH TIME ZONE,
                                     "author_id"    uuid              NOT NULL,
                                     "deleted_at"   TIMESTAMP,
                                     CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
                                 );
        COMMENT
        ON COLUMN "posts"."title" IS '포스트 제목'; COMMENT
        ON COLUMN "posts"."content" IS '포스트 본문 내용'; COMMENT
        ON COLUMN "posts"."excerpt" IS '포스트 요약/미리보기 텍스트'; COMMENT
        ON COLUMN "posts"."thumbnail" IS '포스트 썸네일 이미지 URL'; COMMENT
        ON COLUMN "posts"."access_level" IS '포스트 접근 권한 레벨 (공개/구독자/구매자/비공개)'; COMMENT
        ON COLUMN "posts"."status" IS '포스트 상태 (임시저장/발행됨/예약발행)'; COMMENT
        ON COLUMN "posts"."price" IS '포스트 가격 (유료 포스트인 경우)'; COMMENT
        ON COLUMN "posts"."published_at" IS '포스트 발행 일시'; COMMENT
        ON COLUMN "posts"."author_id" IS '작성자 사용자 ID'`);
    await queryRunner.query(`ALTER TABLE "posts"
            ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_312c63be865c81b922e39c2475e"`
    );
    await queryRunner.query(`DROP TABLE "posts"`);
  }
}
