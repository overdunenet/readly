import { MigrationInterface, QueryRunner } from 'typeorm';

export class follows1771227223872 implements MigrationInterface {
  name = 'follows1771227223872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "follows"
                                 (
                                     "id"          uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
                                     "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
                                     "follower_id" uuid      NOT NULL,
                                     "followee_id" uuid      NOT NULL,
                                     CONSTRAINT "PK_follows_id" PRIMARY KEY ("id"),
                                     CONSTRAINT "UQ_follows_follower_followee" UNIQUE ("follower_id", "followee_id")
                                 );
        COMMENT ON COLUMN "follows"."follower_id" IS '팔로우하는 사용자 ID';
        COMMENT ON COLUMN "follows"."followee_id" IS '팔로우 대상 사용자 ID'`);
    await queryRunner.query(`ALTER TABLE "follows"
        ADD CONSTRAINT "FK_follows_follower" FOREIGN KEY ("follower_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "follows"
        ADD CONSTRAINT "FK_follows_followee" FOREIGN KEY ("followee_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "FK_follows_followee"`
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "FK_follows_follower"`
    );
    await queryRunner.query(`DROP TABLE "follows"`);
  }
}
